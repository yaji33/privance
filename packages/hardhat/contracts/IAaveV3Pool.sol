// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

/// @title IAaveV3Pool
/// @notice Minimal interface for Aave V3 Pool — used to fetch borrower health data for credit scoring (Tier 2 signal)
/// @dev healthFactor is denominated in WAD (1e18 = 1.0). Addresses:
///      Ethereum mainnet : 0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2
///      Sepolia testnet  : 0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951
interface IAaveV3Pool {
    /// @param user The address whose account data is queried
    /// @return totalCollateralBase    Total collateral in USD (8 decimals)
    /// @return totalDebtBase          Total debt in USD (8 decimals)
    /// @return availableBorrowsBase   Available borrow capacity in USD (8 decimals)
    /// @return currentLiquidationThreshold  Liquidation threshold in bps (e.g. 8000 = 80%)
    /// @return ltv                    Loan-to-value ratio in bps
    /// @return healthFactor           Current health factor in WAD (1e18 = healthy, <1e18 = liquidatable)
    function getUserAccountData(address user)
        external
        view
        returns (
            uint256 totalCollateralBase,
            uint256 totalDebtBase,
            uint256 availableBorrowsBase,
            uint256 currentLiquidationThreshold,
            uint256 ltv,
            uint256 healthFactor
        );
}
