export interface PriceInfo {
  currency: string,
  value: string,
  lastUpdatedAt: string
}
export interface TokenPriceInfo {
  prices: PriceInfo[]
}

export interface TokenPriceBySymbolInfo extends TokenPriceInfo {
  symbol: string
};

export interface TokenPriceByAddressInfo extends TokenPriceInfo {
  network: string,
  address: string
};

export interface TokenPriceBySymbolResponse {
  data: TokenPriceBySymbolInfo[];
}

export interface TokenPriceByAddressResponse {
  data: TokenPriceByAddressInfo[];
}

export interface TokenHistoryInfo {
  value: number,
  timestamp: string
}

export interface TokenHistoryResponse {
  data: TokenHistoryInfo[];
}

export type timeframeOptions = '1d' | '1w' | '1m' | 'ytd';

export interface TokenMetadata {
  name: string,
  symbol: string,
  decimals: number,
  logo: string
}

export interface TokenMetadataResponse {
  id: string,
  jsonrpc: string,
  result: TokenMetadata
}

export interface TransferData {
  category: string,
  blockNum: string,
  from: string,
  to: string,
  value?: string,
  erc721TokenId?: string,
  erc1155Metadata?: { tokenId: string, value: string }[],
  tokenId?: string,
  uniqueId?: string,
  hash: string,
  rawContract?: {
    value?: string,
    address?: string,
    decimal?: string
  },
  asset: string,
}

export interface TxHistoryData {
  pageKey: string,
  transfers: TransferData[]
}

export interface TxHistoryResponse {
  id: string,
  jsonrpc: string,
  result: TxHistoryData
}

export interface TokenBalance {
  contractAddress: string,
  tokenBalance: string,
  error?: string,
}

export interface TokenBalancesResult {
  tokenBalances: TokenBalance[];
  address: string
}

export interface TokenBalanceResponses {
  id: string,
  jsonrpc: string,
  result: TokenBalancesResult
}