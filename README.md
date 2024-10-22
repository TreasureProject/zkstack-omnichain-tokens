# Treasure Cross Chain Template

This template is for deploying and interacting with LayerZero V2 OFT/ONFT contracts, along with their corresponding adapters.

## Features

- LayerZero V2 OFT and ONFT contracts
- OFT and ONFT adapters for existing tokens
- Support for regular EVM chains and zkSync
- Hardhat tasks for easy deployment and interaction

## Setup

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Set up your [enviroment
   variables](https://hardhat.org/hardhat-runner/docs/guides/configuration-variables) with your `PRIVATE_KEY`

## Deployment

### Regular EVM Chains

Use Hardhat Deploy:

```bash
npx hardhat deploy --network <network-name> --tags <tag>
```

Available tags: `oftadapter`, `onftadapter`

### zkSync

Use the zkSync-specific deployment command:

```bash
npx hardhat deploy-zksync --network <zksync-network> --tags <tag>
```

Available tags: `oft`, `onft`

Note: The zkSync deployment uses the deploy task provided by [hardhat-zksync-deploy](https://docs.zksync.io/build/tooling/hardhat/plugins/hardhat-zksync-deploy)
## Tasks

### Set Peer

Sets the peer address for an OApp contract, this allows the peered contracts to pass messages cross chain. This must be done for _both_ contracts - the token (OFT/ONFT) and its adapter:

```bash
pnpm hardhat setPeer \
  --network zksepolia \
  --contract-name MyONFT \
  --contract-address 0x0a2c2378B58F53aefbceF041fEbD605b5Ce5ba66 \
  --peer-address 0x5C4b498BF781fcc66BbE8B632583a3D56BF6A2c1 \
  --peer-chain arbsepolia
```

### Send OFT

Sends tokens from an OFT contract:

```bash
pnpm hardhat oft:send \
  --network arbsepolia \
  --contract-name MyOFTAdapter \
  --contract-address 0x1234...5678 \
  --to 0xabcd...ef90 \
  --amount 100.5 \
  --dst-chain zksepolia
```

### Send ONFT

Sends a token from an ONFT contract:

```bash
pnpm hardhat onft:send \
  --network arbsepolia \
  --contractname MyONFTAdapter \
  --contractaddress 0x1234...5678 \
  --to 0xabcd...ef90 \
  --tokenid 42 \
  --dstchain zksepolia
```
## Adapters

For adapter contracts (`MyOFTAdapter` and `MyONFTAdapter`), an existing token address must be specified during deployment. This allows you to add omnichain functionality to pre-existing tokens.

## Networks

The project is currently configured for ArbitrumSepolia and zkSyncSepolia. To add more networks:

1. Add the network configuration to `hardhat.config.ts`
2. Include the LayerZero V2 endpoint information for the network

Example network configuration:

```typescript
sepolia: {
  url: "https://sepolia.infura.io/v3/YOUR-PROJECT-ID",
  accounts,
  lzEndpoint: {
    eid: 40161,
    address: "0x464570adA09869d8741132183721B4f0769a0287"
  }
}
```

LayerZero V2 endpoint information for various networks can be found in the [LayerZero Technical Reference](https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts).

## Developer Notes

- This project uses both `hardhat-deploy` and `hardhat-deploy-zksync` for maximum flexibility.
- LayerZero V2 endpoints are used for cross-chain communication.
- When working with zkSync, be aware of its specific deployment process and limitations.
- Always ensure you're using the correct network and endpoint addresses when interacting with contracts across chains.
- When adding new networks, make sure to include the correct LayerZero endpoint configuration.

For more detailed information on LayerZero V2, refer to the [official
documentation](https://docs.layerzero.network/v2/developers/evm/overview).

