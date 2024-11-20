import "dotenv/config"
import { HardhatUserConfig, vars } from "hardhat/config";
import "hardhat-deploy"
import "@matterlabs/hardhat-zksync";
import "./type-extension"

import "./tasks/setPeer"
import './tasks/bridge'

const accounts = vars.has("PRIVATE_KEY") ? [vars.get("PRIVATE_KEY")] : [];

if (accounts.length === 0) {
  throw new Error("Dont forget to set your env vars: https://hardhat.org/hardhat-runner/docs/guides/configuration-variables")
}

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  paths: {
    deployPaths: "./deploy-zk"
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  deployerAccounts: {
    'zksepolia': 0,
  },
  networks: {
    zksepolia: {
      url: 'https://sepolia.era.zksync.dev',
      ethNetwork: 'sepolia',
      accounts,
      zksync: true,
      verifyURL: 'https://explorer.sepolia.era.zksync.dev/contract_verification',
      lzEndpoint: {
        eid: 40305,
        address: "0xe2Ef622A13e71D9Dd2BBd12cd4b27e1516FA8a09"
      }
    },
    arbsepolia: {
      url: "https://sepolia-rollup.arbitrum.io/rpc",
      ethNetwork: 'sepolia',
      accounts: accounts,
      zksync: false,
      lzEndpoint: {
        eid: 40231,
        address: "0x6EDCE65403992e310A62460808c4b910D972f10f"
      }
    },


    // topaz: {
    //     url: process.env.RPC_URL_TREASURE_CHAIN_TOPAZ,
    //     ethNetwork: 'sepolia',
    //     zksync: true,
    //     verifyURL: 'https://rpc-explorer-verify.topaz.treasure.lol/contract_verification',
    // },
  },
  zksolc: {
    version: 'latest',
    settings: {
      contractsToCompile: ["contracts/MyOFT.sol", "contracts/MyONFT.sol"]
    }
  },
  solidity: {
    version: '0.8.26',
  },
};

export default config;



