import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const EXISTING_TOKEN = "0xD09419A720FBA5Bf38e10482B2A7EC2F3B7112C9";


const func: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();


  const currentNetwork = hre.network.config;

  if (!currentNetwork.lzEndpoint) {
    throw new Error(`No LayerZero endpoint configuration found for network: ${hre.network.name}`);
  }


  await deploy("MyOFTAdapter", {
    from: deployer,
    args: [EXISTING_TOKEN,
      currentNetwork.lzEndpoint.address,
      deployer,
    ],
    log: true,
  });
};

export default func;
func.tags = ["oftadapter"];
