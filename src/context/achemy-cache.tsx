import { timeframeOptions, TokenBalance, TokenHistoryInfo, TokenMetadata, TransferData } from "@interfaces/alchemy";
import { getTokenMetadata, getTokenPriceHistory, getPriceForTokensByAddresses, getAddressTxHistory, getAddressTokenBalances } from "@services/alchemy";
import { createContext, ReactNode, useCallback, useEffect, useReducer } from "react";

interface AlchemyCache {
  tokenInfo: {
    [address: string]: TokenMetadata;
  };
  tokenUsdPrice: {
    [address: string]: number;
  };
  tokenPriceHistory: {
    [address: string]: {
      [timeframe in timeframeOptions]: TokenHistoryInfo[];
    }
  };
  transactions: {
    [address: string]: TransferData[];
  };
  balances: {
    [address: string]: TokenBalance[];
  };
}

type AddOrUpdateTokenInfo = {
  type: 'add_or_update_token_info';
  data: { metadata: TokenMetadata, address: string };
};


type AddOrUpdateTokenPrice = {
  type: 'add_or_update_token_price';
  data: { currentPrice: number, address: string };
};

type AddOrUpdateMultipleTokenPrice = {
  type: 'add_or_update_multiple_token_price';
  data: {  [address: string]: number };
};

type AddOrUpdateTokenPriceHistory = {
  type: 'add_or_update_token_price_history';
  data: { priceHistory: TokenHistoryInfo[], address: string, timeframe: timeframeOptions }
};

type UpdateBalances = {
  type: 'update_balances';
  data:{ balances: TokenBalance[], address: string }
};

type UpdateTransactions = {
  type: 'update_transactions';
  data:{ transactions: TransferData[]; address: string }
};

type ResetAction = {
  type: 'reset';
};

type LoadAction = {
  type: 'load';
  data: AlchemyCache;
};

type AlchemyCacheActions =
  | AddOrUpdateTokenInfo
  | AddOrUpdateTokenPrice
  | AddOrUpdateMultipleTokenPrice
  | AddOrUpdateTokenPriceHistory
  | UpdateTransactions
  | UpdateBalances
  | ResetAction
  | LoadAction;

const initialState: AlchemyCache = {
  tokenInfo: {},
  tokenUsdPrice: {},
  tokenPriceHistory: {},
  transactions: {},
  balances: {},
};

interface IAlchemyCacheContext extends AlchemyCache {
  fetchTokenInfo: (address: string) => Promise<void>;
  fetchTokenPriceHistory: (address: string, timeframe: timeframeOptions) => Promise<void>;
  fetchTokenPrice: (addresses: string) => Promise<void>;
  fetchTokenPrices: (addresses: string[]) => Promise<void>;
  fetchTransactions: (address: string) => Promise<void>;
  fetchBalances: (address: string) => Promise<void>;
}


const cacheReducer = (state: AlchemyCache, action: AlchemyCacheActions) => {
  console.log(action, 'action dispatched');
  if (!action) {
    return state;
  }

  switch (action.type) {
    case 'add_or_update_token_info':
      return {
        ...state,
        tokenInfo: {
          ...state.tokenInfo,
          [action.data.address]: action.data.metadata
        }
      };
    case 'add_or_update_token_price':
      return {
        ...state,
        tokenUsdPrice: {
          ...state.tokenUsdPrice,
          [action.data.address]: action.data.currentPrice
        }
      };
    case 'add_or_update_multiple_token_price':
      return {
        ...state,
        tokenUsdPrice: {
          ...state.tokenUsdPrice,
          ...action.data
        }
      };
    case 'add_or_update_token_price_history':
      return {
        ...state,
        tokenPriceHistory: {
          ...state.tokenPriceHistory,
          [action.data.address]: {
            ...state.tokenPriceHistory[action.data.address],
            [action.data.timeframe]: action.data.priceHistory
          }
        }
      };
    case 'update_balances':
      return {
        ...state,
        balances: {
          [action.data.address]: action.data.balances
        }
      };
    case 'update_transactions':
      return {
        ...state,
        transactions: {
          [action.data.address]: action.data.transactions
        }
      };
    case 'reset':
      return initialState;
    case 'load':
      return action.data;
    default:
      return state;
  }
};

export const AlchemyCacheContext = createContext<IAlchemyCacheContext>({} as IAlchemyCacheContext);

export const AlchemyCacheProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cacheReducer, initialState);

  const fetchTokenInfo = useCallback(async (address: string, ignoreCache = false) => {
    const tokenInfo = state.tokenInfo[address];
    if (!tokenInfo || ignoreCache) {
      const metadata = await getTokenMetadata(address);
      if (!metadata) {
        throw new Error('Error fetching data');
      }
      dispatch({
        type: 'add_or_update_token_info',
        data: {
          address,
          metadata
        }
      });
    }
  }, [ state ]);

  const fetchTokenPrices = useCallback(async (addresses: string[], ignoreCache = false) => {
    const tokenPrices = state.tokenUsdPrice;
    const missingAddresses = addresses.filter(address => !tokenPrices[address]);
    if (missingAddresses.length > 0 || ignoreCache) {
      const prices = await getPriceForTokensByAddresses(ignoreCache ? addresses : missingAddresses);
      if (!prices) {
        throw new Error('Error fetching data');
      }
      const newPrices: { [address: string]: number } = {};
      prices.forEach(price => {
        newPrices[price.address] = Number(price.prices[0].value);
      });
      dispatch({
        type: 'add_or_update_multiple_token_price',
        data: newPrices
      });
    }
  }, [ state ]);

  const fetchTokenPrice = useCallback(async (address: string, ignoreCache = false) => {
    const tokenPrice = state.tokenUsdPrice[address];
    if (!tokenPrice || ignoreCache) {
      const price = await getPriceForTokensByAddresses([address]);
      if (!price) {
        throw new Error('Error fetching data');
      }
      dispatch({
        type: 'add_or_update_token_price',
        data: {
          address,
          currentPrice: Number(price[0].prices[0].value)
        }
      });
    }
  }, [ state ]);

  const fetchTokenPriceHistory = useCallback(async (address: string, timeframe: timeframeOptions, ignoreCache = false) => {
    const tokenPriceHistory = state.tokenPriceHistory[address] && state.tokenPriceHistory[address][timeframe];
    if (!tokenPriceHistory || ignoreCache) {
      const priceHistory = await getTokenPriceHistory(address, timeframe);
      if (!priceHistory) {
        throw new Error('Error fetching data');
      }
      dispatch({
        type: 'add_or_update_token_price_history',
        data: {
          address,
          timeframe,
          priceHistory
        }
      });
    }
  }, [ state ]);

  const fetchTransactions = useCallback(async (address: string, ignoreCache = false) => {
    const transactions = state.transactions[address];
    if (!transactions || ignoreCache) {
      const txHistory = await getAddressTxHistory(address);
      if (!txHistory) {
        throw new Error('Error fetching data');
      }
      dispatch({
        type: 'update_transactions',
        data: {
          address,
          transactions: txHistory.transfers
        }
      });
    }
  }, [ state ]);

  const fetchBalances = useCallback(async (address: string, ignoreCache = false) => {
    const balances = state.balances[address];
    if (!balances || ignoreCache) {
      const tokenBalances = await getAddressTokenBalances(address);
      if (!tokenBalances) {
        throw new Error('Error fetching data');
      }
      dispatch({
        type: 'update_balances',
        data: {
          address,
          balances: tokenBalances
        }
      });
    }
  }, [ state ]);

  useEffect(() => {
    // save to localStorage on every state change
    localStorage.setItem('alchemyCache', JSON.stringify(state));
  }, [ state ]);

  useEffect(() => {
    // load from localStorage on first load
    const cachedData = localStorage.getItem('alchemyCache');
    if (cachedData) {
      dispatch({
        type: 'load',
        data: JSON.parse(cachedData)
      });
    }
  }, []); // on first load

  return (
    <AlchemyCacheContext.Provider value={{...state, fetchTokenInfo, fetchTokenPrice, fetchTokenPrices, fetchTokenPriceHistory, fetchTransactions, fetchBalances }}>
      {children}
    </AlchemyCacheContext.Provider>
  );
};