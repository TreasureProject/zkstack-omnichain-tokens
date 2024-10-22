import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as ethers from "ethers";
import { getNetworkConfig } from "./taskUtils";
import { BytesLike, BigNumberish } from "ethers";
import { Options } from '@layerzerolabs/lz-v2-utilities'


type BaseSendParams = {
  dstEid: number
  to: BytesLike
  extraOptions: BytesLike
  composeMsg: BytesLike
}

type SendParamOFT = BaseSendParams & {
  amountLD: BigNumberish
  minAmountLD: BigNumberish
  oftCmd: BytesLike
}

type SendParamONFT = BaseSendParams & {
  tokenId: BigNumberish
  onftCmd: BytesLike
}

const ERC20_ABI = [
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
];

const ERC721_ABI = [
  "function approve(address to, uint256 tokenId) external",
  "function getApproved(uint256 tokenId) external view returns (address)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)"
];


type LogEntry = [string, string | number | Record<string, any>];

function handleLayerZeroError(error: unknown, context: string = ''): never {
  const errorObj = error as Record<string, any>;
  const logs: LogEntry[] = [
    [`${context ? `[${context}] ` : ''}Error occurred:`, error instanceof Error ? error.message : String(error)]
  ];

  if (errorObj.data?.slice?.(0, 10)) {
    try {
      const decodedError = ethers.AbiCoder.defaultAbiCoder().decode(
        ['address', 'uint256'],
        errorObj.data.slice(10)
      );
      logs.push(['Decoded error:', {
        address: decodedError[0],
        value: decodedError[1].toString()
      }]);
    } catch {
      logs.push(['Error data:', errorObj.data]);
    }
  }

  ['code', 'reason', 'transaction', 'receipt']
    .forEach(prop => errorObj[prop] && logs.push([`${prop}:`, errorObj[prop]]));

  logs.forEach(([label, value]) => console.error(label, value));
  throw error;
}


task('oft:send', 'Sends tokens from OFT')
  .addParam('contractName', "name of the contract", undefined, types.string)
  .addParam('contractAddress', 'address of the contract', undefined, types.string)
  .addParam('to', 'contract address on network B', undefined, types.string)
  .addParam('amount', 'amount to transfer in token decimals', undefined, types.string)
  .addParam('dstChain', 'destination chain name', undefined, types.string)
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { artifacts, config } = hre;
    const { signer } = getNetworkConfig(hre);

    const networkConfig = hre.network.config
    if (!networkConfig.lzEndpoint) {
      throw new Error(`No LayerZero endpoint configuration found for network: ${hre.network.name}`);
    }

    const dstNetworkConfig = config.networks?.[taskArgs.dstChain]
    if (!dstNetworkConfig || !dstNetworkConfig.lzEndpoint) {
      throw new Error(`No LayerZero endpoint configuration found for destination network: ${taskArgs.dstChain}`);
    }

    const oftArtifact = await artifacts.readArtifact(taskArgs.contractName);
    const oftContract = new ethers.Contract(taskArgs.contractAddress, oftArtifact.abi, signer);

    const amount = ethers.parseUnits(taskArgs.amount, 18);
    const options = Options.newOptions().addExecutorLzReceiveOption(65000, 0).toBytes()

    const sendParam: SendParamOFT = {
      dstEid: dstNetworkConfig.lzEndpoint.eid,
      to: ethers.zeroPadValue(taskArgs.to, 32),
      amountLD: amount,
      minAmountLD: amount,
      extraOptions: options,
      composeMsg: '0x',
      oftCmd: '0x',
    };

    try {
      const tokenAddress = await oftContract.token();
      console.log(`Token address: ${tokenAddress}`);

      if (tokenAddress !== taskArgs.contractAddress) {
        console.log('Using OFT Adapter');
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

        console.log(`Approving ${taskArgs.amount} tokens...`);
        const approveTx = await tokenContract.approve(taskArgs.contractAddress, amount);
        await approveTx.wait(3);
        console.log('Approval transaction completed');

        const newAllowance = await tokenContract.allowance(await signer.getAddress(), taskArgs.contractAddress);
        console.log(`New allowance: ${ethers.formatUnits(newAllowance, 18)}`);

        if (newAllowance < amount) {
          throw new Error(
            `Approval failed. Required: ${taskArgs.amount}, Approved: ${ethers.formatUnits(newAllowance, 18)}`
          );
        }
      } else {
        console.log('Using standard OFT. Token is the contract itself.');
      }


      console.log({ sendParam })

      const feeQuote = await oftContract.quoteSend(sendParam, false);

      const messagingFee = {
        nativeFee: feeQuote.nativeFee,
        lzTokenFee: ethers.ZeroAddress,
      };

      console.log(
        `Sending ${taskArgs.amount} token(s) to network ${taskArgs.dstChain} (EID: ${dstNetworkConfig.lzEndpoint.eid})`
      );

      const tx = await oftContract.send(sendParam, messagingFee, await signer.getAddress(), {
        value: messagingFee.nativeFee,
      });

      console.log(`Send tx initiated \n https://layerzeroscan.com/tx/${tx.hash}`);

      const receipt = await tx.wait(3);

      console.log(`Transaction receipt: \n`);
      console.log({ receipt })
    } catch (error) {
      handleLayerZeroError(error, "OFT-Bridge")
    }
  });

task('onft:send', 'Sends tokens from ONFT')
  .addParam('to', 'contract address on network B', undefined, types.string)
  .addParam('tokenid', 'token ID to transfer', undefined, types.string)
  .addParam('dstchain', 'destination chain name', undefined, types.string)
  .addParam('contractname', 'name of the contract', undefined, types.string)
  .addParam('contractaddress', 'address of the contract', undefined, types.string)
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { artifacts, config } = hre;
    const { signer } = getNetworkConfig(hre);
    const networkConfig = hre.network.config
    if (!networkConfig.lzEndpoint) {
      throw new Error(`No LayerZero endpoint configuration found for network: ${hre.network.name}`);
    }
    const dstNetworkConfig = config.networks?.[taskArgs.dstchain]
    if (!dstNetworkConfig || !dstNetworkConfig.lzEndpoint) {
      throw new Error(`No LayerZero endpoint configuration found for destination network: ${taskArgs.dstChain}`);
    }
    const onftArtifact = await artifacts.readArtifact(taskArgs.contractname);
    const onftContract = new ethers.Contract(taskArgs.contractaddress, onftArtifact.abi, signer);
    const options = Options.newOptions().addExecutorLzReceiveOption(100000, 0).toBytes()

    const formattedTokenId = BigInt(taskArgs.tokenid)

    const sendParam: SendParamONFT = {
      dstEid: dstNetworkConfig.lzEndpoint.eid,
      to: ethers.zeroPadValue(taskArgs.to, 32),
      tokenId: formattedTokenId,
      extraOptions: options,
      composeMsg: '0x',
      onftCmd: '0x',
    }
    try {
      const tokenAddress = await onftContract.token();
      console.log(`Token address: ${tokenAddress}`);

      if (tokenAddress !== onftContract.address) {
        console.log('Using Adapter')
        console.log('Token Contract Address:', tokenAddress)
        console.log('ONFT Contract Address:', onftContract.target)


        const tokenContract = new ethers.Contract(
          tokenAddress,
          ERC721_ABI, signer
        )


        console.log(`Approving token ID: ${taskArgs.tokenid}`)
        const approveTx = await tokenContract.approve(onftContract.target, formattedTokenId)
        await approveTx.wait(3)
        console.log('Approval transaction completed')

      } else {
        console.log('Using standard ONFT. Token is the contract itself.')
      }


      const feeQuote = await onftContract.quoteSend(sendParam, false);
      const messagingFee = {
        nativeFee: feeQuote.nativeFee,
        lzTokenFee: ethers.ZeroAddress,
      };
      console.log(
        `Sending token with ID ${taskArgs.tokenid} to network ${taskArgs.dstchain} (EID: ${dstNetworkConfig.lzEndpoint.eid})`
      );
      const tx = await onftContract.send(sendParam, messagingFee, await signer.getAddress(), {
        value: messagingFee.nativeFee,
      });
      console.log(`Send tx initiated \n https://layerzeroscan.com/tx/${tx.hash}`);
      const receipt = await tx.wait(3);
      console.log(`Transaction receipt: \n`);
      console.log({ receipt })
    } catch (error) {
      handleLayerZeroError(error, "ONFT-Bridge")
    }
  });
