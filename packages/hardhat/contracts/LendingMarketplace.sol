// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint64, ebool, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import "./CollateralManager.sol";
import "./RepaymentTracker.sol";

contract LendingMarketplace is ZamaEthereumConfig {

    struct BorrowerData {
        euint64 creditScore;
        bool hasScore;
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

    CollateralManager public collateralManager;
    RepaymentTracker public repaymentTracker;

    event DataSubmitted(address indexed borrower);
    event CreditScoreComputed(address indexed borrower);
    event LoanRequested(uint256 indexed loanId, address indexed borrower);
    event OfferCreated(uint256 indexed offerId, address indexed lender);
    event LoanMatched(uint256 indexed loanId, uint256 indexed offerId);
    event LoanFunded(uint256 indexed loanId, address indexed lender, address indexed borrower);

    address public owner;

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

    function hasCreditScore() external view returns (bool) {
        return borrowers[msg.sender].hasScore;
    }

    function getCreditScore() external view returns (euint64) {
        require(borrowers[msg.sender].hasScore, "No score computed");
        return borrowers[msg.sender].creditScore;
    }

    function createLoanRequest(
        externalEuint64 amountExternal, bytes calldata amountProof,
        uint256 plainRequestedAmount,
        uint256 plainDuration
    ) external returns (uint256) {
        require(borrowers[msg.sender].hasScore, "Must have credit score first");
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
        emit LoanRequested(loanId, msg.sender);
        return loanId;
    }

    function createLenderOffer(
        externalEuint64 minScoreExternal, bytes calldata minScoreProof,
        externalEuint64 maxAmountExternal, bytes calldata maxAmountProof,
        uint256 collateralPercentage,
        uint256 plainInterestRate,
        uint256 plainMaxLoanAmount
    ) external payable returns (uint256) {
        require(msg.value > 0, "Must deposit funds");
        require(collateralPercentage <= 10000, "Too high");
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
        emit OfferCreated(offerId, msg.sender);
        return offerId;
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

        euint64 encCompleted = FHE.asEuint64(uint64(completed));
        euint64 encDefaulted = FHE.asEuint64(uint64(defaulted));

        FHE.allowThis(encCompleted);
        FHE.allowThis(encDefaulted);

        euint64 repaymentComponent = computeRepaymentComponent(encCompleted);
        euint64 penaltyComponent = computePenaltyComponent(encDefaulted);

        euint64 rawScore = FHE.sub(
            FHE.add(FHE.asEuint64(500), repaymentComponent),
            penaltyComponent
        );
        FHE.allowThis(rawScore);

        euint64 finalScore = clampScore(rawScore);
        FHE.allowThis(finalScore);
        FHE.allow(finalScore, msg.sender);

        borrowers[msg.sender].creditScore = finalScore;
        borrowers[msg.sender].hasScore = true;

        emit CreditScoreComputed(msg.sender);
    }

    function computeRepaymentComponent(euint64 completed) internal returns (euint64) {
        euint64 raw = FHE.mul(completed, 50);
        FHE.allowThis(raw);
        euint64 C300 = FHE.asEuint64(300);
        ebool above300 = FHE.gt(raw, C300);
        FHE.allowThis(above300);
        euint64 result = FHE.select(above300, C300, raw);
        FHE.allowThis(result);
        return result;
    }

    function computePenaltyComponent(euint64 defaulted) internal returns (euint64) {
        euint64 result = FHE.mul(defaulted, FHE.asEuint64(100));
        FHE.allowThis(result);
        return result;
    }

    function clampScore(euint64 score) internal returns (euint64) {
        euint64 C300 = FHE.asEuint64(300);
        euint64 C850 = FHE.asEuint64(850);
        ebool below300 = FHE.lt(score, C300);
        FHE.allowThis(below300);
        ebool above850 = FHE.gt(score, C850);
        FHE.allowThis(above850);
        euint64 clampedLow = FHE.select(below300, C300, score);
        FHE.allowThis(clampedLow);
        euint64 result = FHE.select(above850, C850, clampedLow);
        FHE.allowThis(result);
        return result;
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
        // Grant lender permission to decrypt the match result
        FHE.allow(matches, offer.lender);

        // FIX: store the encrypted result
        loanOfferMatches[loanId][offerId] = MatchResult({ result: matches, exists: true });

        emit LoanMatched(loanId, offerId);
    }

    function fundLoan(uint256 loanId, uint256 offerId) external {
        LoanRequest storage loan = loanRequests[loanId];
        LenderOffer storage offer = lenderOffers[offerId];

        require(msg.sender == offer.lender, "Not the lender");
        require(loan.isActive && !loan.isFunded, "Loan not available");
        require(loanOfferMatches[loanId][offerId].exists, "Match not computed");

        uint256 collateralRequired = 
            (offer.availableFunds * offer.collateralPercentage) / 10000;

        require(
            collateralManager.getUserCollateral(loan.borrower) >= collateralRequired,
            "Insufficient collateral"
        );

        collateralManager.lockCollateral(loan.borrower, collateralRequired, loanId);

        repaymentTracker.createAgreement(
            loanId, offerId, loan.borrower, msg.sender,
            loan.plainRequestedAmount, offer.plainInterestRate,
            loan.plainDuration, collateralRequired
        );

        loan.isFunded = true;
        loan.lender = msg.sender;
        loan.isActive = false;
        offer.isActive = false;

        payable(loan.borrower).transfer(offer.availableFunds);

        emit LoanFunded(loanId, msg.sender, loan.borrower);
    }

    function getMatchResult(uint256 loanId, uint256 offerId) 
        external view returns (ebool) 
    {
        require(loanOfferMatches[loanId][offerId].exists, "No match computed");
        return loanOfferMatches[loanId][offerId].result;
    }
}