// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "./CollateralManager.sol";

contract RepaymentTracker {

    struct RepaymentAgreement {
        uint256 agreementId;
        uint256 loanId;
        uint256 offerId;
        address borrower;
        address lender;
        uint256 principal;
        uint256 interestRate;    
        uint256 duration;      
        uint256 collateralAmount;
        uint256 totalRepaymentAmount;
        uint256 amountRepaid;
        uint256 dueDate;
        uint256 creationTime;
        bool isActive;
        bool isRepaid;
        bool isDefaulted;
    }

    mapping(uint256 => RepaymentAgreement) private agreements;
    mapping(address => uint256[]) public borrowerAgreements;
    mapping(address => uint256[]) public lenderAgreements;

    uint256 public nextAgreementId;
    address public lendingMarketplace;
    address public owner;
    CollateralManager public collateralManager;

    event AgreementCreated(uint256 indexed agreementId, uint256 loanId, uint256 offerId);
    event PaymentMade(uint256 indexed agreementId, uint256 amount, uint256 remainingBalance);
    event AgreementRepaid(uint256 indexed agreementId);
    event LoanDefaulted(uint256 indexed agreementId);

    modifier onlyMarketplace() {
        require(msg.sender == lendingMarketplace, "Only marketplace");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyBorrower(uint256 agreementId) {
        require(agreements[agreementId].borrower == msg.sender, "Only borrower");
        _;
    }

    constructor(address _lendingMarketplace, address _collateralManager) {
        lendingMarketplace = _lendingMarketplace;
        collateralManager = CollateralManager(_collateralManager);
        owner = msg.sender;
    }

    function updateMarketplace(address _lendingMarketplace) external onlyOwner {
        lendingMarketplace = _lendingMarketplace;
    }

    function createAgreement(
        uint256 loanId,
        uint256 offerId,
        address borrower,
        address lender,
        uint256 principal,
        uint256 interestRate,
        uint256 duration,
        uint256 collateralAmount
    ) external onlyMarketplace returns (uint256) {
        uint256 agreementId = nextAgreementId++;

        uint256 interestAmount = (principal * interestRate * duration) / (10000 * 365);
        uint256 totalRepayment = principal + interestAmount;

        agreements[agreementId] = RepaymentAgreement({
            agreementId: agreementId,
            loanId: loanId,
            offerId: offerId,
            borrower: borrower,
            lender: lender,
            principal: principal,
            interestRate: interestRate,
            duration: duration,
            collateralAmount: collateralAmount,
            totalRepaymentAmount: totalRepayment,
            amountRepaid: 0,
            dueDate: block.timestamp + (duration * 1 days),
            creationTime: block.timestamp,
            isActive: true,
            isRepaid: false,
            isDefaulted: false
        });

        borrowerAgreements[borrower].push(agreementId);
        lenderAgreements[lender].push(agreementId);

        emit AgreementCreated(agreementId, loanId, offerId);
        return agreementId;
    }

    /// @notice Make a payment towards loan repayment
    function makePayment(uint256 agreementId) external payable onlyBorrower(agreementId) {
        RepaymentAgreement storage agreement = agreements[agreementId];
        require(agreement.isActive, "Agreement not active");
        require(!agreement.isRepaid, "Already repaid");
        require(!agreement.isDefaulted, "Loan defaulted");
        require(msg.value > 0, "Payment must be > 0");

        agreement.amountRepaid += msg.value;
        payable(agreement.lender).transfer(msg.value);

        if (agreement.amountRepaid >= agreement.totalRepaymentAmount) {
            agreement.isRepaid = true;
            agreement.isActive = false;
            collateralManager.releaseCollateral(agreement.loanId);
            emit AgreementRepaid(agreementId);
        }

        uint256 remaining = agreement.amountRepaid >= agreement.totalRepaymentAmount
            ? 0
            : agreement.totalRepaymentAmount - agreement.amountRepaid;

        emit PaymentMade(agreementId, msg.value, remaining);
    }

    /// @notice Check and mark defaulted loans (callable by anyone)
    function checkDefault(uint256 agreementId) external {
        RepaymentAgreement storage agreement = agreements[agreementId];
        if (
            agreement.isActive &&
            !agreement.isRepaid &&
            !agreement.isDefaulted &&
            block.timestamp > agreement.dueDate
        ) {
            agreement.isDefaulted = true;
            agreement.isActive = false;
            collateralManager.liquidateCollateral(agreement.loanId, agreement.lender);
            emit LoanDefaulted(agreementId);
        }
    }

    function getAgreementDetails(uint256 agreementId) external view returns (
        address borrower,
        address lender,
        uint256 principal,
        uint256 interestRate,
        uint256 totalDue,
        uint256 amountPaid,
        uint256 dueDate,
        bool isActive
    ) {
        RepaymentAgreement memory a = agreements[agreementId];
        require(
            msg.sender == a.borrower ||
            msg.sender == a.lender ||
            msg.sender == lendingMarketplace,
            "Not authorized"
        );
        return (
            a.borrower,
            a.lender,
            a.principal,
            a.interestRate,
            a.totalRepaymentAmount,
            a.amountRepaid,
            a.dueDate,
            a.isActive
        );
    }

    function getAgreementStatus(uint256 agreementId) external view returns (string memory) {
        RepaymentAgreement memory a = agreements[agreementId];
        if (a.isRepaid) return "REPAID";
        if (a.isDefaulted) return "DEFAULTED";
        if (block.timestamp > a.dueDate) return "OVERDUE";
        if (a.isActive) return "ACTIVE";
        return "INACTIVE";
    }

    function getBorrowerAgreements(address borrower) external view returns (uint256[] memory) {
        return borrowerAgreements[borrower];
    }

    function getLenderAgreements(address lender) external view returns (uint256[] memory) {
        return lenderAgreements[lender];
    }

    function getTimeUntilDue(uint256 agreementId) external view returns (uint256) {
        RepaymentAgreement memory a = agreements[agreementId];
        if (block.timestamp >= a.dueDate) return 0;
        return a.dueDate - block.timestamp;
    }

    function calculateMonthlyPayment(uint256 agreementId) external view returns (uint256) {
        RepaymentAgreement memory a = agreements[agreementId];
        uint256 months = a.duration / 30;
        if (months == 0) months = 1;
        return a.totalRepaymentAmount / months;
    }
}