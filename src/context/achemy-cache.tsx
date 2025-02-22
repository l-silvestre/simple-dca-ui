import { timeframeOptions, TokenBalance, TokenHistoryInfo, TokenMetadata, TransferData } from "@interfaces/alchemy";
import { getTokenMetadata, getTokenPriceHistory, getPriceForTokensByAddresses, getAddressTxHistory, getAddressTokenBalances } from "@services/alchemy";
import { createContext, ReactNode, useCallback, useEffect, useMemo, useReducer } from "react";
import { Mutex } from 'async-mutex';

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
  errors: {
   [ cacheSection: string ]: string;
  }
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

type AddError = {
  type: 'add_error';
  data: { cacheSection: string, error: string }
}

type RemoveError = {
  type: 'remove_error';
  data: { cacheSection: string }
}

type AlchemyCacheActions =
  | AddOrUpdateTokenInfo
  | AddOrUpdateTokenPrice
  | AddOrUpdateMultipleTokenPrice
  | AddOrUpdateTokenPriceHistory
  | UpdateTransactions
  | UpdateBalances
  | ResetAction
  | LoadAction
  | AddError
  | RemoveError;

const initialState: AlchemyCache = {
  tokenInfo: {},
  tokenUsdPrice: {},
  tokenPriceHistory: {},
  transactions: {},
  balances: {},
  errors: {},
};

interface IAlchemyCacheContext extends AlchemyCache {
  fetchTokenInfo: (address: string, ignoreCache?: boolean) => Promise<void>;
  fetchTokenPriceHistory: (address: string, timeframe: timeframeOptions, ignoreCache?: boolean) => Promise<void>;
  fetchTokenPrice: (addresses: string, ignoreCache?: boolean) => Promise<void>;
  fetchTokenPrices: (addresses: string[], ignoreCache?: boolean) => Promise<void>;
  fetchTransactions: (address: string, ignoreCache?: boolean) => Promise<void>;
  fetchBalances: (address: string, ignoreCache?: boolean) => Promise<void>;
}


const cacheReducer = (state: AlchemyCache, action: AlchemyCacheActions) => {
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
    case 'add_error':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.data.cacheSection]: action.data.error
        }
      };
    case 'remove_error':
      const errors = { ...state.errors };
      delete errors[action.data.cacheSection];
      return {
        ...state,
        errors
      };
    default:
      return state;
  }
};

export const AlchemyCacheContext = createContext<IAlchemyCacheContext>({} as IAlchemyCacheContext);

export const AlchemyCacheProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cacheReducer, initialState);
  const fetchInfoMutex = useMemo(() => new Mutex(), []);
  const fetchTokenPricesMutex = useMemo(() => new Mutex(), []);
  const fetchPriceMutex = useMemo(() => new Mutex(), []);
  const fetchPriceHistoryMutex = useMemo(() => new Mutex(), []);
  const fetchTransactionsMutex = useMemo(() => new Mutex(), []);
  const fetchBalancesMutex = useMemo(() => new Mutex(), []);

  const fetchTokenInfo = useCallback(async (address: string, ignoreCache = false) => {
    const tokenInfo = state.tokenInfo[address];
    if (!tokenInfo || ignoreCache) {
      if (fetchInfoMutex.isLocked()) {
        return;
      }
      const release = await fetchInfoMutex.acquire();
      const metadata = await getTokenMetadata(address);
      if (!metadata) {
        dispatch({
          type: 'add_error',
          data: {
            cacheSection: 'tokenInfo',
            error: 'Error fetching data'
          }
        });
        release();
        throw new Error('Error fetching data');
      }
      dispatch({
        type: 'add_or_update_token_info',
        data: {
          address,
          metadata
        }
      });
      release();
    }
  }, [ fetchInfoMutex, state ]);

  const fetchTokenPrices = useCallback(async (addresses: string[], ignoreCache = false) => {
    const tokenPrices = state.tokenUsdPrice;
    const missingAddresses = addresses.filter(address => !tokenPrices[address]);
    if (missingAddresses.length > 0 || ignoreCache) {
      if (fetchTokenPricesMutex.isLocked()) {
        return;
      }
      const release = await fetchTokenPricesMutex.acquire();
      const prices = await getPriceForTokensByAddresses(ignoreCache ? addresses : missingAddresses);
      if (!prices) {
        dispatch({
          type: 'add_error',
          data: {
            cacheSection: 'tokenUsdPrices',
            error: 'Error fetching data'
          }
        })
        release();
        throw new Error('Error fetching data');
      }
      const newPrices: { [address: string]: number } = {};
      prices.forEach(price => {
        if (price.prices.length === 0) {
          newPrices[price.address] = 0;
        } else {
          newPrices[price.address] = Number(price.prices[0].value);
        }
      });
      dispatch({
        type: 'add_or_update_multiple_token_price',
        data: newPrices
      });
      release();
    }
  }, [ fetchTokenPricesMutex, state ]);

  const fetchTokenPrice = useCallback(async (address: string, ignoreCache = false) => {
    const tokenPrice = state.tokenUsdPrice[address];
    if (!tokenPrice || ignoreCache) {
      if (fetchTokenPricesMutex.isLocked()) {
        return;
      }
      const release = await fetchTokenPricesMutex.acquire();
      const price = await getPriceForTokensByAddresses([address]);
      if (!price) {
        dispatch({
          type: 'add_error',
          data: {
            cacheSection: 'tokenUsdPrice',
            error: 'Error fetching data'
          }
        });
        release();
        throw new Error('Error fetching data');
      }
      dispatch({
        type: 'add_or_update_token_price',
        data: {
          address,
          currentPrice: Number(price[0].prices[0].value)
        }
      });
      release();
    }
  }, [ fetchPriceMutex, state ]);

  const fetchTokenPriceHistory = useCallback(async (address: string, timeframe: timeframeOptions, ignoreCache = false) => {
    const tokenPriceHistory = state.tokenPriceHistory[address] && state.tokenPriceHistory[address][timeframe];
    if (!tokenPriceHistory || ignoreCache) {
      if (fetchPriceHistoryMutex.isLocked()) {
        return;
      }
      const release = await fetchPriceHistoryMutex.acquire();
      const priceHistory = await getTokenPriceHistory(address, timeframe);
      if (!priceHistory) {
        dispatch({
          type: 'add_error',
          data: {
            cacheSection: 'tokenPriceHistory',
            error: 'Error fetching data'
          }
        });
        release();
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
      release();
    }
  }, [ fetchPriceHistoryMutex, state ]);

  const fetchTransactions = useCallback(async (address: string, ignoreCache = false) => {
    const transactions = state.transactions[address];
    if (!transactions || ignoreCache) {
      if (fetchTransactionsMutex.isLocked()) {
        return;
      }
      const release = await fetchTransactionsMutex.acquire();
      const txHistory = await getAddressTxHistory(address);
      if (!txHistory) {
        dispatch({
          type: 'add_error',
          data: {
            cacheSection: 'transactions',
            error: 'Error fetching data'
          }
        });
        release();
        throw new Error('Error fetching data');
      }
      dispatch({
        type: 'update_transactions',
        data: {
          address,
          transactions: txHistory.transfers
        }
      });
      release();
    }
  }, [ fetchTransactionsMutex, state ]);

  const fetchBalances = useCallback(async (address: string, ignoreCache = false) => {
    const balances = state.balances[address];
    if (!balances || ignoreCache) {
      if (fetchBalancesMutex.isLocked()) {
        return;
      }
      const release = await fetchBalancesMutex.acquire();
      const tokenBalances = await getAddressTokenBalances(address);
      if (!tokenBalances) {
        dispatch({
          type: 'add_error',
          data: {
            cacheSection: 'balances',
            error: 'Error fetching data'
          }
        });
        release();
        throw new Error('Error fetching data');
      }
      dispatch({
        type: 'update_balances',
        data: {
          address,
          balances: tokenBalances
        }
      });
      release();
    }
  }, [ fetchBalancesMutex, state ]);

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