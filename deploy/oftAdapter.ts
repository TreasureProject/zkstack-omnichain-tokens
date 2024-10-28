import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const EXISTING_TOKEN = null;


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
