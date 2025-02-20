import 'viem/window';
import {
  createContext,
  Dispatch,
  ReactNode,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { useLocalStorage } from '@hooks/useLocalStorage';
import { useEvmProviders } from '@hooks/useEvmProviders';
import { EIP6963ProviderDetail } from '@interfaces/evm';
import { enqueueSnackbar } from 'notistack';
import { Backdrop } from '@mui/material';
import { motion } from 'motion/react';
import { createPublicClient, createWalletClient, custom, EIP1193Provider, erc20Abi, formatUnits, getContract, PublicClient, WalletClient } from 'viem'

// icons
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import { arbitrum } from 'viem/chains';

const USDC_CONTRACT = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';

type WalletConnectedAction = {
  type: 'wallet_connected';
  walletClient: WalletClient;
  publicClient: PublicClient;
  address: string;
  ethBalance: number;
  usdcBalance: number;
};

type UpdateUSDCBalanceAction = {
  type: 'update_usdc_balance';
  newBalance: number;
};

type UpdateProvidersAction = {
  type: 'update_providers';
  providers: EIP6963ProviderDetail[];
};

type WalletDisconnectedAction = {
  type: 'wallet_disconnected';
};

type SetWalletWrongChainAction = {
  type: 'wallet_wrong_chain';
  isWrongChain: boolean;
};

type EVMWalletAction =
  | WalletConnectedAction
  | WalletDisconnectedAction
  | UpdateProvidersAction
  | UpdateUSDCBalanceAction
  | SetWalletWrongChainAction;

interface EVMWalletState {
  walletClient: WalletClient | null;
  publicClient: PublicClient | null;
  waitingforWallet: boolean;
  currentAddress: string;
  ethBalance: number;
  usdcBalance: number;
  providers: EIP6963ProviderDetail[];
  isWrongChain: boolean;
}

interface IEVMWalletContext extends EVMWalletState {
  connect: (provider?: EIP6963ProviderDetail) => Promise<void>;
  updateUsdcBalance: (newBalance: number) => void;
  switchChain: () => void;
  disconnect: () => void;
}

const walletReducer = (state: EVMWalletState, action: EVMWalletAction) => {
  if (!action) {
    return state;
  }

  switch (action.type) {
    case 'wallet_connected':
      return {
        ...state,
        wallletClient: action.walletClient,
        publicClient: action.publicClient,
        currentAddress: action.address,
        ethBalance: action.ethBalance,
        usdcBalance: action.usdcBalance,
        isWrongChain: false,
      };
    case 'wallet_disconnected':
      return {
        ...state,
        walletClient: null,
        publicClient: null,
        currentAddress: '',
        ethBalance: 0,
        usdcBalance: 0,
        isWrongChain: false,
      };
    case 'update_providers':
      return {
        ...state,
        providers: action.providers,
      };
    case 'update_usdc_balance':
      return {
        ...state,
        usdcBalance: action.newBalance,
      };
    case 'wallet_wrong_chain':
      return {
        ...state,
        walletClient: null,
        publicClient: null,
        currentAddress: '',
        ethBalance: 0,
        usdcBalance: 0,
        isWrongChain: action.isWrongChain,
      };
    default:
      return state;
  }
};

const initialState: EVMWalletState = {
  currentAddress: '',
  ethBalance: 0,
  usdcBalance: 0,
  providers: [],
  isWrongChain: false,
  walletClient: null,
  publicClient: null,
  waitingforWallet: false,
};

const asyncEvmWalletconnect = async (
  dispatch: Dispatch<EVMWalletAction>,
  setPreviousProvider: (provider: string) => void,
  provider: EIP6963ProviderDetail,
) => {
  try {
    const [ account ] = await (provider.provider as EIP1193Provider || window.ethereum).request({ method: 'eth_requestAccounts' });

    const walletClient = createWalletClient({
      account,
      chain: arbitrum,
      transport: custom(provider.provider as EIP1193Provider || window.ethereum)
    });

    const publicClient = createPublicClient({
      chain: arbitrum,
      transport: custom(provider.provider as EIP1193Provider || window.ethereum)
    });

    const ethBalance = Number(await publicClient.getBalance({ address: account }));
    const contract = getContract({
      address: USDC_CONTRACT,
      abi: erc20Abi,
      client: { wallet: walletClient, public: publicClient }
    });
    const unparsedUsdcBalance = await contract.read.balanceOf([ account ]);
    const decimals = await contract.read.decimals();
    let usdcBalance = 0;
    if (typeof unparsedUsdcBalance === 'bigint' && typeof decimals === 'number') {
      usdcBalance = Number(formatUnits(unparsedUsdcBalance, decimals));
    }


    dispatch({ type: 'wallet_connected', walletClient, publicClient, address: account, ethBalance, usdcBalance });
    setPreviousProvider(provider.info.name);
  } catch (error) {
    console.error('Error connecting wallet', error);

    // disconnect the wallet immediately to avoid bugs
    dispatch({ type: 'wallet_disconnected' });
    setPreviousProvider('');
    enqueueSnackbar(
      'We were unable to connect to your wallet. Check if you are logged into the wallet, if it is configured correctly or if there already any pending requests on it and try again.\nIf the problem persists, try refreshing the page.',
      {
        variant: 'error',
        autoHideDuration: 6000,
        style: { fontWeight: 700, whiteSpace: 'pre-wrap' },
      },
    );
  }
};

const handleChainChanged = async (dispatch: Dispatch<EVMWalletAction>) => {
  console.log('Chain changed', dispatch);

  /* if ((await getCurrentChainId()) !== arbitrum.id) {
    //
    dispatch({ type: 'wallet_wrong_chain', isWrongChain: true });
  } else {
    const address = getConnectedAddress();
    const ethBalance = await getEthBalance();
    const usdcBalance = await getUsdcBalance();
    dispatch({ type: 'wallet_connected', address, ethBalance, usdcBalance });
  } */
};

export const EVMWalletContext = createContext<IEVMWalletContext>({} as IEVMWalletContext);

export const EVMWalletProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(walletReducer, initialState);
  const [currentProvider, setCurrentProvider] = useState<EIP6963ProviderDetail | null>(null);
  const providers = useEvmProviders();
  const { localStorageValue: previousProvider, updateStorageValue: setPreviousProvider } =
    useLocalStorage('evmProvider');

  const handleConnect = async (provider?: EIP6963ProviderDetail) => {
    if (provider) {
      await asyncEvmWalletconnect(dispatch, setPreviousProvider, provider);
      setCurrentProvider(provider);
    } else {
      // connect to the previous provider
      const previousConnectedProvider = providers.find(
        (provider) => provider.info.name === previousProvider,
      );
      if (previousConnectedProvider) {
        setCurrentProvider(previousConnectedProvider);
        await asyncEvmWalletconnect(dispatch, setPreviousProvider, previousConnectedProvider);
      } else {
        throw new Error('No previous provider found');
      }
    }
  };

  const handleAccountChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      dispatch({ type: 'wallet_disconnected' });
      setPreviousProvider('');
    } else if (accounts[0] !== state.currentAddress) {
      await asyncEvmWalletconnect(
        dispatch,
        setPreviousProvider,
        currentProvider as EIP6963ProviderDetail,
      );
    } else {
      // wallet already connected ignore
    }
  };

  // update the connect function with async method
  const value = useMemo(
    () =>
      ({
        ...state,
        switchChain: () => {},
        connect: handleConnect,
        updateUsdcBalance: (newBalance: number) =>
          dispatch({ type: 'update_usdc_balance', newBalance }),
        disconnect: () => {
          dispatch({ type: 'wallet_disconnected' });
          setPreviousProvider('');
        },
      } as IEVMWalletContext),
    [state, dispatch, handleConnect, setPreviousProvider],
  );

  useEffect(() => {
    if (currentProvider) {
      // subscribe to wallet changes
      currentProvider.provider.on('accountsChanged', handleAccountChanged);
      currentProvider.provider.on('chainChanged', async () => handleChainChanged(dispatch));

      return () => {
        currentProvider.provider.removeListener('chainChanged', async () =>
          handleChainChanged(dispatch),
        );
        currentProvider.provider.removeListener('accountsChanged', handleAccountChanged);
      };
    }
  }, [currentProvider]);

  useEffect(() => {
    dispatch({ type: 'update_providers', providers });
    (async () => {
      if (previousProvider) {
        await handleConnect();
      }
    })();
  }, [previousProvider, providers]);

  /* const handleUsdcReceived = (log: Log[]) => {
    const latest = log.pop();

    if (latest) {
      const { data } = latest;
      const received = Number(hexToBigInt(data));
      dispatch({ type: 'update_usdc_balance', newBalance: state.usdcBalance + received });
    }
  }; */

  /* useEffect(() => {
    if (state.currentAddress) {
      const unwatch = subscribe(state.currentAddress as `0x${string}`, handleUsdcReceived);

      return () => unwatch();
    }
  }, [state]); */

  return <EVMWalletContext.Provider value={value}>
    {children}
    <Backdrop
      sx={{
        zIndex: 1000,
        backdropFilter: 'blur(6px)',
        backgroundColor: 'rgba(240,240,240,0.6)',
        borderRadius: '10px',
      }}
      open={value.waitingforWallet}
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { delay: 0.1, duration: 0.4 } }}
        className='w-full max-w-[600px] flex flex-col gap-3'
      >
        <div className='flex items-center gap-3 py-3 px-6 rounded-xl bg-[#3aaaaa] text-white text-lg font-medium'>
          <InfoRoundedIcon />
          Please continue on your wallet.
        </div>

        <div className='flex items-center gap-3 py-3 px-6 rounded-xl bg-slate-600 text-white text-md'>
          Your wallet should be currently asking you to accept this connection.
        </div>
      </motion.div>
    </Backdrop>
  </EVMWalletContext.Provider>;
};
