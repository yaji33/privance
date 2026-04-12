import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  const PLACEHOLDER = "0x0000000000000000000000000000000000000001";
  const collateral = await get("CollateralManager");

  const result = await deploy("RepaymentTracker", {
    from: deployer,
    args: [PLACEHOLDER, collateral.address],
    log: true,
  });

  console.log("RepaymentTracker deployed to:", result.address);
};

export default func;
func.id = "deploy_repayment";
func.tags = ["RepaymentTracker"];
func.dependencies = ["CollateralManager"];