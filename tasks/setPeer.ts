import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getNetworkConfig } from "./taskUtils";
import { NetworkConfig } from "hardhat/types";

task("setPeer", "Set peer for OApp contract")
  .addParam("contractName", "The name of the contract")
  .addParam("contractAddress", "The address of the deployed contract")
  .addParam("peerAddress", "The peer address to set")
  .addParam("peerChain", "The name of the peer chain (e.g., 'zksepolia', 'arbsepolia')")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { artifacts, config, ethers } = hre;

    const { signer } = getNetworkConfig(hre);

    const currentNetwork = hre.network.config
    if (!currentNetwork.lzEndpoint) {
      throw new Error(`No LayerZero endpoint configuration found for network: ${hre.network.name}`);
    }

    const artifact = await artifacts.readArtifact(taskArgs.contractName);
    const contract = new ethers.Contract(taskArgs.contractAddress, artifact.abi, signer);

    const formattedAddress = ethers.zeroPadValue(taskArgs.peerAddress, 32);

    const peerNetwork = config.networks?.[taskArgs.peerChain] as NetworkConfig;
    if (!peerNetwork || !peerNetwork.lzEndpoint) {
      throw new Error(`No LayerZero configuration found for peer chain: ${taskArgs.peerChain}`);
    }

    console.log(`Network: ${hre.network.name} (EID: ${currentNetwork.lzEndpoint.eid})`);
    console.log(`Setting peer for ${taskArgs.contractName} at ${taskArgs.contractAddress}`);
    console.log(`Peer address: ${taskArgs.peerAddress}`);
    console.log(`Peer chain: ${taskArgs.peerChain} (EID: ${peerNetwork.lzEndpoint.eid})`);

    const tx = await contract.setPeer(peerNetwork.lzEndpoint.eid, formattedAddress);
    console.log("Transaction sent:", tx.hash);

    const receipt = await tx.wait(2);
    console.log("Transaction confirmed in block:", receipt.blockNumber);
    console.log("Gas used:", receipt.gasUsed.toString());
  });
