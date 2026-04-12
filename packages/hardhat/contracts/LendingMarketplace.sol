// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint64, ebool, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import "./CollateralManager.sol";
import "./RepaymentTracker.sol";
import "./IAaveV3Pool.sol";

/// @title LendingMarketplace
/// @notice Privacy-preserving lending protocol using FHE for encrypted credit scoring and loan matching.
///         Credit scores are never revealed on-chain — lenders set encrypted minimum thresholds
///         and the match comparison is performed entirely in the encrypted domain via FHEVM.
/// @dev Inherits ZamaEthereumConfig to configure the on-chain FHE coprocessor.
contract LendingMarketplace is ZamaEthereumConfig {

    struct BorrowerData {
        euint64 creditScore;
        bool hasScore;
        uint256 scoreTimestamp;
    }

    struct LoanRequest {
        address borrower;
        euint64 requestedAmount;
        uint256 plainRequestedAmount;
        uint256 plainDuration;
        uint256 timestamp;
        bool isActive;
        bool isFunded;
        address lender;
    }

    struct LenderOffer {
        address lender;
        euint64 minCreditScore;
        euint64 maxLoanAmount;
        uint256 availableFunds;
        bool isActive;
        uint256 collateralPercentage;
        uint256 plainInterestRate;
        uint256 plainMaxLoanAmount;
    }

    struct MatchResult {
        ebool result;
        bool exists;
    }

    mapping(address => BorrowerData) private borrowers;
    mapping(uint256 => LoanRequest) public loanRequests;
    mapping(uint256 => LenderOffer) public lenderOffers;
    mapping(uint256 => mapping(uint256 => MatchResult)) private loanOfferMatches;

    uint256 public nextLoanId;
    uint256 public nextOfferId;

    address public owner;
    CollateralManager public collateralManager;
    RepaymentTracker public repaymentTracker;

    IAaveV3Pool public aavePool;
    uint256 public scoreValidityPeriod;

    event CreditScoreComputed(address indexed borrower);
    event LoanRequested(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 duration);
    event LoanRequestCancelled(uint256 indexed loanId, address indexed borrower);
    event OfferCreated(uint256 indexed offerId, address indexed lender, uint256 funds);
    event LenderOfferCancelled(uint256 indexed offerId, address indexed lender, uint256 refund);
    event LoanMatched(uint256 indexed loanId, uint256 indexed offerId);
    event LoanFunded(uint256 indexed loanId, address indexed lender, address indexed borrower, uint256 amount);
    event AavePoolUpdated(address indexed newPool);
    event ScoreValidityPeriodUpdated(uint256 newPeriod);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(address _collateralManager, address _repaymentTracker) {
        owner = msg.sender;
        collateralManager = CollateralManager(_collateralManager);
        repaymentTracker = RepaymentTracker(_repaymentTracker);
    }

    function updateCollateralManager(address _collateralManager) external onlyOwner {
        collateralManager = CollateralManager(_collateralManager);
    }

    function updateRepaymentTracker(address _repaymentTracker) external onlyOwner {
        repaymentTracker = RepaymentTracker(_repaymentTracker);
    }

    /// @notice Set or unset the Aave V3 Pool for Tier-2 credit scoring. 
    function setAavePool(address _aavePool) external onlyOwner {
        aavePool = IAaveV3Pool(_aavePool);
        emit AavePoolUpdated(_aavePool);
    }

    /// @notice Set how long a credit score stays valid (seconds). 0 = never expires.
    function setScoreValidityPeriod(uint256 _period) external onlyOwner {
        scoreValidityPeriod = _period;
        emit ScoreValidityPeriodUpdated(_period);
    }

    function hasCreditScore() external view returns (bool) {
        return _isScoreValid(msg.sender);
    }

    function getCreditScore() external view returns (euint64) {
        require(_isScoreValid(msg.sender), "No valid score");
        return borrowers[msg.sender].creditScore;
    }

    function getScoreTimestamp() external view returns (uint256) {
        return borrowers[msg.sender].scoreTimestamp;
    }

    function computeCreditScore() external {
        uint256[] memory agreementIds = repaymentTracker.getBorrowerAgreements(msg.sender);

        uint256 completed = 0;
        uint256 defaulted = 0;
        for (uint256 i = 0; i < agreementIds.length; i++) {
            string memory status = repaymentTracker.getAgreementStatus(agreementIds[i]);
            if (keccak256(bytes(status)) == keccak256(bytes("REPAID"))) completed++;
            if (keccak256(bytes(status)) == keccak256(bytes("DEFAULTED"))) defaulted++;
        }

        uint64 aaveBonus = _getAaveBonus(msg.sender);

        euint64 encCompleted = FHE.asEuint64(uint64(completed));
        euint64 encDefaulted = FHE.asEuint64(uint64(defaulted));
        FHE.allowThis(encCompleted);
        FHE.allowThis(encDefaulted);

        euint64 repaymentComponent = _computeRepaymentComponent(encCompleted);
        euint64 penaltyComponent = _computePenaltyComponent(encDefaulted);

        euint64 gains = FHE.add(FHE.asEuint64(500), repaymentComponent);
        FHE.allowThis(gains);

        ebool penaltyExceedsGains = FHE.gt(penaltyComponent, gains);
        FHE.allowThis(penaltyExceedsGains);
        euint64 cappedPenalty = FHE.select(penaltyExceedsGains, gains, penaltyComponent);
        FHE.allowThis(cappedPenalty);

        euint64 nativeRaw = FHE.sub(gains, cappedPenalty);
        FHE.allowThis(nativeRaw);

        euint64 encAaveBonus = FHE.asEuint64(aaveBonus);
        FHE.allowThis(encAaveBonus);
        euint64 rawScore = FHE.add(nativeRaw, encAaveBonus);
        FHE.allowThis(rawScore);

        euint64 finalScore = _clampScore(rawScore);
        FHE.allowThis(finalScore);
        FHE.allow(finalScore, msg.sender);

        borrowers[msg.sender].creditScore = finalScore;
        borrowers[msg.sender].hasScore = true;
        borrowers[msg.sender].scoreTimestamp = block.timestamp;

        emit CreditScoreComputed(msg.sender);
    }

    function createLoanRequest(
        externalEuint64 amountExternal,
        bytes calldata amountProof,
        uint256 plainRequestedAmount,
        uint256 plainDuration
    ) external returns (uint256) {
        require(_isScoreValid(msg.sender), "Valid credit score required");
        require(plainRequestedAmount > 0, "Amount must be > 0");
        require(plainDuration > 0, "Duration must be > 0");

        euint64 amount = FHE.fromExternal(amountExternal, amountProof);
        FHE.allowThis(amount);
        FHE.allow(amount, msg.sender);
        FHE.allowThis(borrowers[msg.sender].creditScore);

        uint256 loanId = nextLoanId++;
        loanRequests[loanId] = LoanRequest({
            borrower: msg.sender,
            requestedAmount: amount,
            plainRequestedAmount: plainRequestedAmount,
            plainDuration: plainDuration,
            timestamp: block.timestamp,
            isActive: true,
            isFunded: false,
            lender: address(0)
        });

        emit LoanRequested(loanId, msg.sender, plainRequestedAmount, plainDuration);
        return loanId;
    }

    /// @notice Borrower cancels an unfunded loan request.
    function cancelLoanRequest(uint256 loanId) external {
        LoanRequest storage loan = loanRequests[loanId];
        require(msg.sender == loan.borrower, "Not borrower");
        require(loan.isActive && !loan.isFunded, "Cannot cancel");
        loan.isActive = false;
        emit LoanRequestCancelled(loanId, msg.sender);
    }

    function createLenderOffer(
        externalEuint64 minScoreExternal,
        bytes calldata minScoreProof,
        externalEuint64 maxAmountExternal,
        bytes calldata maxAmountProof,
        uint256 collateralPercentage,
        uint256 plainInterestRate,
        uint256 plainMaxLoanAmount
    ) external payable returns (uint256) {
        require(msg.value > 0, "Must deposit funds");
        require(collateralPercentage <= 10000, "Collateral percentage too high");

        euint64 minScore = FHE.fromExternal(minScoreExternal, minScoreProof);
        euint64 maxAmount = FHE.fromExternal(maxAmountExternal, maxAmountProof);
        FHE.allowThis(minScore);
        FHE.allowThis(maxAmount);
        FHE.allow(minScore, msg.sender);
        FHE.allow(maxAmount, msg.sender);

        uint256 offerId = nextOfferId++;
        lenderOffers[offerId] = LenderOffer({
            lender: msg.sender,
            minCreditScore: minScore,
            maxLoanAmount: maxAmount,
            availableFunds: msg.value,
            isActive: true,
            collateralPercentage: collateralPercentage,
            plainInterestRate: plainInterestRate,
            plainMaxLoanAmount: plainMaxLoanAmount
        });

        emit OfferCreated(offerId, msg.sender, msg.value);
        return offerId;
    }

    /// @notice Lender withdraws their offer and reclaims unfunded ETH.
    function cancelLenderOffer(uint256 offerId) external {
        LenderOffer storage offer = lenderOffers[offerId];
        require(msg.sender == offer.lender, "Not lender");
        require(offer.isActive, "Offer not active");
        require(offer.availableFunds > 0, "No funds to withdraw");

        uint256 refund = offer.availableFunds;
        offer.availableFunds = 0;
        offer.isActive = false;

        payable(msg.sender).transfer(refund);
        emit LenderOfferCancelled(offerId, msg.sender, refund);
    }

    function checkLoanMatch(uint256 loanId, uint256 offerId) external {
        LoanRequest storage loan = loanRequests[loanId];
        LenderOffer storage offer = lenderOffers[offerId];
        BorrowerData storage borrower = borrowers[loan.borrower];

        require(loan.isActive && !loan.isFunded, "Loan not available");
        require(offer.isActive, "Offer not active");
        require(borrower.hasScore, "Borrower has no score");

        FHE.allowThis(borrower.creditScore);
        FHE.allowThis(loan.requestedAmount);
        FHE.allowThis(offer.minCreditScore);
        FHE.allowThis(offer.maxLoanAmount);

        ebool scoreMatches = FHE.ge(borrower.creditScore, offer.minCreditScore);
        FHE.allowThis(scoreMatches);

        ebool amountMatches = FHE.le(loan.requestedAmount, offer.maxLoanAmount);
        FHE.allowThis(amountMatches);

        ebool matches = FHE.and(scoreMatches, amountMatches);
        FHE.allowThis(matches);
        FHE.allow(matches, offer.lender);
        FHE.allow(matches, loan.borrower);

        loanOfferMatches[loanId][offerId] = MatchResult({ result: matches, exists: true });

        emit LoanMatched(loanId, offerId);
    }

    function fundLoan(uint256 loanId, uint256 offerId) external {
        LoanRequest storage loan = loanRequests[loanId];
        LenderOffer storage offer = lenderOffers[offerId];

        require(msg.sender == offer.lender, "Not the lender");
        require(loan.isActive && !loan.isFunded, "Loan not available");
        require(offer.isActive, "Offer not active");
        require(loanOfferMatches[loanId][offerId].exists, "Match not computed");

        uint256 loanAmount = loan.plainRequestedAmount;
        require(offer.availableFunds >= loanAmount, "Insufficient lender funds");

        uint256 collateralRequired = (loanAmount * offer.collateralPercentage) / 10000;
        require(
            collateralManager.getAvailableCollateral(loan.borrower) >= collateralRequired,
            "Insufficient borrower collateral"
        );

        // Deduct loaned amount; deactivate offer only when exhausted
        offer.availableFunds -= loanAmount;
        if (offer.availableFunds == 0) {
            offer.isActive = false;
        }

        collateralManager.lockCollateral(loan.borrower, collateralRequired, loanId);

        repaymentTracker.createAgreement(
            loanId,
            offerId,
            loan.borrower,
            msg.sender,
            loanAmount,
            offer.plainInterestRate,
            loan.plainDuration,
            collateralRequired
        );

        loan.isFunded = true;
        loan.lender = msg.sender;
        loan.isActive = false;

        payable(loan.borrower).transfer(loanAmount);

        emit LoanFunded(loanId, msg.sender, loan.borrower, loanAmount);
    }

    function getMatchResult(uint256 loanId, uint256 offerId) external view returns (ebool) {
        require(loanOfferMatches[loanId][offerId].exists, "No match computed");
        return loanOfferMatches[loanId][offerId].result;
    }

    function getOfferRemainingFunds(uint256 offerId) external view returns (uint256) {
        return lenderOffers[offerId].availableFunds;
    }

    function _isScoreValid(address borrower) internal view returns (bool) {
        if (!borrowers[borrower].hasScore) return false;
        if (scoreValidityPeriod == 0) return true;
        return block.timestamp - borrowers[borrower].scoreTimestamp <= scoreValidityPeriod;
    }

    function _getAaveBonus(address borrower) internal view returns (uint64) {
        if (address(aavePool) == address(0)) return 0;
        try aavePool.getUserAccountData(borrower) returns (
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256 healthFactor
        ) {
            if (healthFactor >= 3e18) return 200;
            if (healthFactor >= 2e18) return 150;
            if (healthFactor >= 1500000000000000000) return 100;
            if (healthFactor >= 1e18) return 50;
            return 0;
        } catch {
            return 0;
        }
    }

    /// @dev Repayment bonus: 50 points per completed loan, capped at 300.
    function _computeRepaymentComponent(euint64 completed) internal returns (euint64) {
        euint64 raw = FHE.mul(completed, 50);
        FHE.allowThis(raw);
        euint64 cap = FHE.asEuint64(300);
        ebool above300 = FHE.gt(raw, cap);
        FHE.allowThis(above300);
        euint64 result = FHE.select(above300, cap, raw);
        FHE.allowThis(result);
        return result;
    }

    /// @dev Default penalty: 100 points per defaulted loan.
    function _computePenaltyComponent(euint64 defaulted) internal returns (euint64) {
        euint64 result = FHE.mul(defaulted, 100);
        FHE.allowThis(result);
        return result;
    }

    /// @dev Clamps the score to the [300, 850] FICO-analogous range.
    function _clampScore(euint64 score) internal returns (euint64) {
        euint64 floor = FHE.asEuint64(300);
        euint64 ceiling = FHE.asEuint64(850);
        ebool belowFloor = FHE.lt(score, floor);
        FHE.allowThis(belowFloor);
        euint64 clampedLow = FHE.select(belowFloor, floor, score);
        FHE.allowThis(clampedLow);
        ebool aboveCeiling = FHE.gt(clampedLow, ceiling);
        FHE.allowThis(aboveCeiling);
        euint64 result = FHE.select(aboveCeiling, ceiling, clampedLow);
        FHE.allowThis(result);
        return result;
    }
}