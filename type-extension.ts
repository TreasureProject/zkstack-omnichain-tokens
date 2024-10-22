import "hardhat/types/config";

declare module "hardhat/types/config" {
  export interface HardhatNetworkUserConfig {
    lzEndpoint?: {
      eid: number;
      address: string;
    };
  }

  export interface HardhatNetworkConfig {
    lzEndpoint?: {
      eid: number;
      address: string;
    };
  }

  export interface HttpNetworkUserConfig {
    lzEndpoint?: {
      eid: number;
      address: string;
    };
  }

  export interface HttpNetworkConfig {
    lzEndpoint?: {
      eid: number;
      address: string;
    };
  }
}
