import { NetworkConfig } from 'hardhat/types';
import * as hre from "hardhat";

const deployOFT = async function() {


  const currentNetwork = hre.network.config as NetworkConfig
  if (!currentNetwork.lzEndpoint) {
    throw new Error(`No LayerZero endpoint configuration found for network: ${hre.network.name}`);
  }

  const wallet = await hre.deployer.getWallet();
  const constructorArguments = ["ZkOFT",
    "zkOFT",
    currentNetwork.lzEndpoint.address,
    wallet.address];

  const artifact = await hre.deployer.loadArtifact("MyOFT");
  const contract = await hre.deployer.deploy(artifact, constructorArguments);

  console.log(contract)
}
export default deployOFT;
deployOFT.tags = ["oft"];
