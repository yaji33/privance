// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

contract CollateralManager {

    struct CollateralLock {
        address borrower;
        uint256 amount;
        uint256 loanId;
        uint256 lockTime;
        bool isLocked;
    }

    mapping(address => uint256) public userCollateral;
    mapping(uint256 => CollateralLock) public collateralLocks;
    mapping(address => uint256[]) public userLockedLoans;

    address public lendingMarketplace;
    address public owner;

    event CollateralDeposited(address indexed user, uint256 amount);
    event CollateralWithdrawn(address indexed user, uint256 amount);
    event CollateralLocked(address indexed user, uint256 loanId, uint256 amount);
    event CollateralReleased(address indexed user, uint256 loanId, uint256 amount);
    event CollateralLiquidated(address indexed user, uint256 loanId, uint256 amount);

    modifier onlyMarketplace() {
        require(msg.sender == lendingMarketplace, "Only marketplace");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(address _lendingMarketplace) {
        lendingMarketplace = _lendingMarketplace;
        owner = msg.sender;
    }

    /// @notice Update marketplace address (called during deployment wiring)
    function updateMarketplace(address _lendingMarketplace) external onlyOwner {
        lendingMarketplace = _lendingMarketplace;
    }

    /// @notice Deposit ETH as collateral
    function depositCollateral() external payable {
        require(msg.value > 0, "Must deposit some ETH");
        userCollateral[msg.sender] += msg.value;
        emit CollateralDeposited(msg.sender, msg.value);
    }

    /// @notice Withdraw unused collateral
    function withdrawCollateral(uint256 amount) external {
        require(userCollateral[msg.sender] >= amount, "Insufficient collateral");
        uint256 locked = getTotalLockedCollateral(msg.sender);
        uint256 available = userCollateral[msg.sender] - locked;
        require(available >= amount, "Collateral is locked");
        userCollateral[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit CollateralWithdrawn(msg.sender, amount);
    }

    /// @notice Lock collateral for a specific loan (called by marketplace)
    function lockCollateral(
        address borrower,
        uint256 amount,
        uint256 loanId
    ) external onlyMarketplace {
        require(userCollateral[borrower] >= amount, "Insufficient collateral");
        collateralLocks[loanId] = CollateralLock({
            borrower: borrower,
            amount: amount,
            loanId: loanId,
            lockTime: block.timestamp,
            isLocked: true
        });
        userLockedLoans[borrower].push(loanId);
        emit CollateralLocked(borrower, loanId, amount);
    }

    /// @notice Release collateral after loan repayment
    function releaseCollateral(uint256 loanId) external onlyMarketplace {
        CollateralLock storage lock = collateralLocks[loanId];
        require(lock.isLocked, "Collateral not locked");
        lock.isLocked = false;
        emit CollateralReleased(lock.borrower, loanId, lock.amount);
    }

    /// @notice Liquidate collateral for defaulted loan
    function liquidateCollateral(
        uint256 loanId,
        address liquidator
    ) external onlyMarketplace {
        CollateralLock storage lock = collateralLocks[loanId];
        require(lock.isLocked, "Collateral not locked");
        userCollateral[lock.borrower] -= lock.amount;
        lock.isLocked = false;
        payable(liquidator).transfer(lock.amount);
        emit CollateralLiquidated(lock.borrower, loanId, lock.amount);
    }

    /// @notice Get user's total collateral balance
    function getUserCollateral(address user) external view returns (uint256) {
        return userCollateral[user];
    }

    /// @notice Get user's total locked collateral
    function getTotalLockedCollateral(address user) public view returns (uint256) {
        uint256 totalLocked = 0;
        uint256[] memory lockedLoans = userLockedLoans[user];
        for (uint256 i = 0; i < lockedLoans.length; i++) {
            CollateralLock memory lock = collateralLocks[lockedLoans[i]];
            if (lock.isLocked && lock.borrower == user) {
                totalLocked += lock.amount;
            }
        }
        return totalLocked;
    }

    /// @notice Get user's available (unlocked) collateral
    function getAvailableCollateral(address user) external view returns (uint256) {
        return userCollateral[user] - getTotalLockedCollateral(user);
    }
}