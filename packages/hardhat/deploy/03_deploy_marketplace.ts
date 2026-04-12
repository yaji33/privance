import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get, execute } = hre.deployments;

  const collateral = await get("CollateralManager");
  const repayment = await get("RepaymentTracker");

  const result = await deploy("LendingMarketplace", {
    from: deployer,
    args: [collateral.address, repayment.address],
    log: true,
  });

  await execute(
    "CollateralManager",
    { from: deployer, log: true },
    "updateMarketplace",
    result.address
  );

  await execute(
    "RepaymentTracker",
    { from: deployer, log: true },
    "updateMarketplace",
    result.address
  );

  console.log("LendingMarketplace deployed to:", result.address);
};

export default func;
func.id = "deploy_marketplace";
func.tags = ["LendingMarketplace"];
func.dependencies = ["CollateralManager", "RepaymentTracker"];