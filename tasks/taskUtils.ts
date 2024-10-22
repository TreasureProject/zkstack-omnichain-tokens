import { ethers } from "ethers";
import { Provider, Wallet } from "zksync-ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { HttpNetworkAccountsUserConfig, HttpNetworkConfig } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync";

interface NetworkConfig {
  provider: ethers.Provider;
  signer: ethers.Wallet | Wallet;
}
export function getNetworkConfig(hre: HardhatRuntimeEnvironment): NetworkConfig {
  const { network } = hre;
  const networkConfig = network.config as HttpNetworkConfig;

  if (!networkConfig.url) {
    throw new Error(`No URL provided for network: ${network.name}`);
  }

  let provider;
  let signer;

  if (networkConfig.zksync) {
    provider = new Provider(networkConfig.url);

  } else {
    provider = new ethers.JsonRpcProvider(networkConfig.url);
  }

  const accounts = networkConfig.accounts as HttpNetworkAccountsUserConfig;
  let privateKey: string;

  if (Array.isArray(accounts)) {
    privateKey = accounts[0];
  } else if (typeof accounts === 'object' && accounts.mnemonic) {
    privateKey = ethers.Wallet.fromPhrase(accounts.mnemonic).privateKey;
  } else {
    throw new Error("Unable to get account from network configuration");
  }

  if (networkConfig.zksync) {
    signer = new Wallet(privateKey, provider as Provider);
  } else {
    signer = new ethers.Wallet(privateKey, provider);

  }

  return { provider, signer };
}
