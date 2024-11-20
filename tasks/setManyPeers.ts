import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { readFileSync } from 'fs';
import { resolve } from 'path';

type LayerZeroConfig = {
  [network: string]: {
    tokens: {
      name: string;
      address: string;
      peers: {
        network: string;
        address: string;
      }[];
    }[];
  }
}

task('peer:setup', 'Setup peers for tokens across multiple networks')
  .addOptionalParam('network', 'Specific network to setup', undefined, types.string)
  .addOptionalParam('tokenName', 'Specific token to setup', undefined, types.string)
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    // Load JSON config
    const configPath = resolve(process.cwd(), 'layerzero.config.json');
    const configJson = JSON.parse(readFileSync(configPath, 'utf8')) as LayerZeroConfig;

    const { artifacts, ethers } = hre;

    // Filter networks if specified
    const networks = taskArgs.network
      ? [taskArgs.network]
      : Object.keys(configJson);

    for (const networkName of networks) {
      if (!hre.config.networks?.[networkName]?.lzEndpoint) {
        throw new Error(
          `Network ${networkName} missing LayerZero endpoint configuration in hardhat.config.ts`
        );
      }

      const networkConfig = configJson[networkName];
      if (!networkConfig?.tokens) {
        console.log(`No tokens configured for network ${networkName}`);
        continue;
      }

      // Filter tokens if specified
      const tokens = taskArgs.tokenName
        ? networkConfig.tokens.filter(t => t.name === taskArgs.tokenName)
        : networkConfig.tokens;

      console.log(`\nSetting up peers on ${networkName}:`);

      for (const token of tokens) {
        console.log(`\nToken: ${token.name} (${token.address})`);

        const contract = new ethers.Contract(
          token.address,
          (await artifacts.readArtifact(token.name)).abi,
          (await hre.ethers.getSigners())[0]
        );

        for (const peer of token.peers) {
          const peerNetwork = hre.config.networks?.[peer.network];
          if (!peerNetwork?.lzEndpoint) {
            throw new Error(
              `Peer network ${peer.network} missing LayerZero endpoint configuration in hardhat.config.ts`
            );
          }

          const peerEid = peerNetwork.lzEndpoint.eid;
          const peerAddress = ethers.zeroPadValue(peer.address, 32);

          console.log(`Setting peer for ${peer.network} (EID: ${peerEid}):`);
          console.log(`- Address: ${peer.address}`);

          try {
            const tx = await contract.setPeer(peerEid, peerAddress);
            await tx.wait();
            console.log('✓ Peer set successfully');
          } catch (error) {
            console.error(`Error setting peer:`, error);
            throw error;
          }
        }
      }
    }
  });
