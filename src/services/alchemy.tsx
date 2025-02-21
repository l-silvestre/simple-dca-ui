import { TokenBalanceResponses, timeframeOptions, TokenHistoryResponse, TokenMetadataResponse, TokenPriceByAddressResponse, TokenPriceBySymbolResponse, TxHistoryResponse, TxHistoryData } from "@interfaces/alchemy";
import { fetchData } from "@utils/common";

const ALCHEMY_BASE_URL = 'https://api.g.alchemy.com';
const ARBITRUM_ALCHEMY_BASE_URL = 'https://arb-mainnet.g.alchemy.com/v2';
const PRICES_API = '/prices/v1';
const HISTORICAL_API = '/tokens/historical';
const ALCHEMY_TOKEN = '32-EGuvMsmYGnkHnL2UszOMHzcj0WryX';

export const getTokenPriceHistory = async (address: string, timeframe: timeframeOptions, network = 'arb-mainnet') => {
  const currentTimestamp = Date.now();
  let startTime; // Start of the time range in ISO 8601 format.
  let endTime; // End of the time range in ISO 8601 format.
  let interval; // (5m, 7d), (1h, 30d), (1d, 1yr)

  switch (timeframe) {
    case '1w':
      // get prices for the last week, adjust the interval to 1d
      startTime = new Date(currentTimestamp - 7 * 24 * 60 * 60 * 1000).toISOString();
      endTime = new Date(currentTimestamp).toISOString();
      interval = '1d';
      break;
    case '1m':
      // get prices for the last month, adjust the interval to 1d
      startTime = new Date(currentTimestamp - 30 * 24 * 60 * 60 * 1000).toISOString();
      endTime = new Date(currentTimestamp).toISOString();
      interval = '1d';
      break;
    case 'ytd':
      // get prices for the year to date, adjust the interval to 1d
      startTime = new Date(currentTimestamp - 365 * 24 * 60 * 60 * 1000).toISOString();
      endTime = new Date(currentTimestamp).toISOString();
      interval = '1d';
      break;
    case '1d': // default to 1d
    default:
      // get prices for the last 24 hours, adjust the interval to 1h
      startTime = new Date(currentTimestamp - 24 * 60 * 60 * 1000).toISOString();
      endTime = new Date(currentTimestamp).toISOString();
      interval = '5m';
      break;
  };
  const options = {
    method: 'POST',
    headers: {accept: 'application/json', 'content-type': 'application/json'},
    body: JSON.stringify({
      address,
      network,
      startTime,
      endTime,
      interval
    })
  };
  const { data } = await fetchData<TokenHistoryResponse>(`${ALCHEMY_BASE_URL}${PRICES_API}/${ALCHEMY_TOKEN}${HISTORICAL_API}`, options);

  return data;
};

export const getPriceForTokensBySymbols = async (symbols: string[]) => {
  const symbolsStr = symbols.join('&symbols=');
  const { data } = await fetchData<TokenPriceBySymbolResponse>(`${ALCHEMY_BASE_URL}${PRICES_API}/${ALCHEMY_TOKEN}/tokens/by-symbol?symbols=${symbolsStr}`);

  return data;
};

export const getPriceForTokensByAddresses = async (addresses: string[], network = 'arb-mainnet') => {
  const options = {
    method: 'POST',
    headers: {accept: 'application/json', 'content-type': 'application/json'},
    body: JSON.stringify({
      addresses: addresses.map(address => ({address, network}))
    })
  };
  const { data } = await fetchData<TokenPriceByAddressResponse>(`${ALCHEMY_BASE_URL}${PRICES_API}/${ALCHEMY_TOKEN}/tokens/by-address`, options);

  return data;
};

export const getTokenMetadata = async (address: string) => {
  const options = {
    method: 'POST',
    headers: {accept: 'application/json', 'content-type': 'application/json'},
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: 'alchemy_getTokenMetadata',
      params: [address]
    })
  };
  const { result: data } = await fetchData<TokenMetadataResponse>(`${ARBITRUM_ALCHEMY_BASE_URL}/${ALCHEMY_TOKEN}`, options);

  return data;
}

export const getAddressTxHistory = async (address: string) => {
  const outOptions = {
    method: 'POST',
    headers: {accept: 'application/json', 'content-type': 'application/json'},
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: 'alchemy_getAssetTransfers',
      params: [{
        fromBlock: '0x0',
        toBlock: 'latest',
        fromAddress: address,
        category: ['external', 'erc20']
      }]
    })
  };
  const { result: outData } = await fetchData<TxHistoryResponse>(`${ARBITRUM_ALCHEMY_BASE_URL}/${ALCHEMY_TOKEN}`, outOptions);

  const inOptions = {
    method: 'POST',
    headers: {accept: 'application/json', 'content-type': 'application/json'},
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: 'alchemy_getAssetTransfers',
      params:[{
        fromBlock: '0x0',
        toBlock: 'latest',
        toAddress: address,
        category: ['external', 'erc20']
      }]
    })
  };

  const { result: inData } = await fetchData<TxHistoryResponse>(`${ARBITRUM_ALCHEMY_BASE_URL}/${ALCHEMY_TOKEN}`, inOptions);
  
  return {
    pageKey: '0',
    transfers: outData.transfers.concat(inData.transfers).sort((a, b) => Number(BigInt(a.blockNum)) - Number(BigInt(b.blockNum)))
  } as TxHistoryData;
};

export const getAddressTokenBalances = async (address: string) => {
  const options = {
    method: 'POST',
    headers: {accept: 'application/json', 'content-type': 'application/json'},
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: 'alchemy_getTokenBalances',
      params: [address, 'erc20']
    })
  };
  const { result: { tokenBalances: data} } = await fetchData<TokenBalanceResponses>(`${ARBITRUM_ALCHEMY_BASE_URL}/${ALCHEMY_TOKEN}`, options);

  return data;
};