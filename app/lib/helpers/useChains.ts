import chains from "@/lib/chains.json";
import { ChainData } from "@/app/types/types";
import { findBestMatch } from "string-similarity";
import { Chain } from "viem";

export const API_URLS: Record<Chain["network"], string> = {
  'homestead': 'https://api.etherscan.io',
  'goerli': 'https://api-goerli.etherscan.io',
  'sepolia': 'https://api-sepolia.etherscan.io',
  'arbitrum': 'https://api.arbiscan.io',
  'arbitrum-goerli': 'https://api-goerli.arbiscan.io',
  'matic': 'https://api.polygonscan.com',
  'maticmum': 'https://api-testnet.polygonscan.com',
  'optimism': 'https://api-optimistic.etherscan.io',
  'optimism-goerli': 'https://api-goerli.optimistic.etherscan.io',
}

export const API_KEYS: Record<Chain["network"], string | undefined> = {
  'homestead': process.env.ETHERSCAN_API_KEY,
  'goerli': process.env.ETHERSCAN_API_KEY,
  'sepolia': process.env.ETHERSCAN_API_KEY,
  'arbitrum': process.env.ARBISCAN_API_KEY,
  'arbitrum-goerli': process.env.ARBISCAN_API_KEY,
  'matic': process.env.POLYGONSCAN_API_KEY,
  'maticmum': process.env.POLYGONSCAN_API_KEY,
  'optimism': process.env.OPTIMISM_API_KEY,
  'optimism-goerli': process.env.OPTIMISM_API_KEY,
}


export const getChainMatch = (chain: string): Chain | undefined => {
  // get the chain object from the chains.json file. Direct match || partial match
  const findAttempt = chains.find((item) => item.name.toLowerCase() === chain.toLowerCase());

  const matchedChain: ChainData = findAttempt?.chainId
    ? findAttempt
    : (chains.find((chainItem) => {
        const formattedChain = chainItem.name.toLowerCase().replace(/[-_]/g, "");
        const formattedInput = chain.toLowerCase().replace(/[-_]/g, "");
        return (
          findBestMatch(
            formattedInput,
            chains.map((item) => item?.name?.toLowerCase().replace(/[-_]/g, ""))
          ).bestMatch.target === formattedChain
        );
      }) as ChainData);

  const viemChain: Chain | undefined = {
    id: matchedChain.chainId,
    name: matchedChain.nativeCurrency.name,
    network: matchedChain.shortName.toLowerCase(),
    nativeCurrency: {
      name: matchedChain.nativeCurrency.name,
      symbol: matchedChain.nativeCurrency.symbol,
      decimals: matchedChain.nativeCurrency.decimals,
    },
    rpcUrls: {
      public: { http: matchedChain.rpc },
      default: { http: matchedChain.rpc },
    },
    blockExplorers: matchedChain.explorers && {
      etherscan: {
        name: matchedChain.explorers[0].name,
        url: matchedChain.explorers[0].url,
      },
      default: {
        name: matchedChain.explorers[0].name,
        url: matchedChain.explorers[0].url,
      },
    },
  };

  return viemChain;
};

export const getRpcUrl = (viemChain: Chain): string | undefined => {
    const rpcUrl: string = viemChain?.rpcUrls.default.http[0]?.replace(
        "${INFURA_API_KEY}",
        process.env.INFURA_API_KEY || ""
      );
        return rpcUrl;
}

export const getExplorerUrl = (viemChain: Chain): string | undefined => {
    return viemChain?.blockExplorers?.default.url;
}