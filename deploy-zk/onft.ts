import { NetworkConfig } from 'hardhat/types';
import * as hre from "hardhat";

const deployONFT = async function() {

  const currentNetwork = hre.network.config as NetworkConfig
  if (!currentNetwork.lzEndpoint) {
    throw new Error(`No LayerZero endpoint configuration found for network: ${hre.network.name}`);
  }

  const wallet = await hre.deployer.getWallet();
  const constructorArguments = ['MyONFT', 'MONFT', currentNetwork.lzEndpoint.address, wallet.address, 'https://yourmediaapi.com/metadata'];
  const artifact = await hre.deployer.loadArtifact("MyONFT");
  const contract = await hre.deployer.deploy(artifact, constructorArguments);

  console.log(contract)
}
export default deployONFT;
deployONFT.tags = ["onft"];
