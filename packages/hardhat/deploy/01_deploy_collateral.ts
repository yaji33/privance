import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy} = hre.deployments;

  const PLACEHOLDER = "0x0000000000000000000000000000000000000001";

  const result = await deploy("CollateralManager", {
    from: deployer,
    args: [PLACEHOLDER],
    log: true,
  });

  console.log("CollateralManager deployed to:", result.address);
};

export default func;
func.id = "deploy_collateral";
func.tags = ["CollateralManager"];