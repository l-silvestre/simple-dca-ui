import { useState, useEffect, createContext, FC, ReactNode, useContext, useMemo, ComponentType } from 'react';
import { BigNumber, ContractTransaction, ethers } from 'ethers';
import SimpleDCATask from '../SimpleDCATask.json';
import ERC20 from '../ERC20.json'
import { DAI_GOERLI_ADDRESS, DCA_CONTRACT_ADDRESS, USDC_GOERLI_ADDRESS, WBTC_GOERLI_ADDRESS, WETH_GOERLI_ADDRESS } from '../constants';
import { IERC20, ISimpleDCATask } from '../interfaces';
import { getLogoUrl } from '../helpers';
import { getAddress } from 'ethers/lib/utils';
import { Alert, Slide, SlideProps, Snackbar } from '@mui/material';
interface WatchAssetParams {
  type: string; // In the future, other standards will be supported
  options: {
    address: string; // The address of the token contract
    'symbol': string; // A ticker symbol or shorthand, up to 11 characters
    decimals: number; // The number of token decimals
    image: string; // A string url of the token logo
  };
}

interface MetamaskContext {
  account: string;
  balance: number;
  chain: number;
  hasWrongChainError: boolean;
  hasOngoingTransaction: boolean;
  connect: () => Promise<void>,
  getPoolFee: () => Promise<number>,
  wrapEth: (amount: number) => Promise<boolean>,
  getContractVariables: () => Promise<void>,
  addToken: (symbol: string) => Promise<void>,
  swapForUsdc: (amount: number) => Promise<boolean>,
  approve: (tokenSymbol: string, amount: number) => Promise<boolean>,
  createTask: (amount: number, duration: number, buyTokenSymbol: string) => Promise<boolean>,
  getInvestments: () => Promise<void>,
  depositFunds: (amount: number) => Promise<void>,
  balanceOf: (tokenSymbol: string) => Promise<number>,
}

type TransitionProps = Omit<SlideProps, 'direction'>;

function TransitionLeft(props: TransitionProps) {
  return <Slide {...props} direction="left" />;
}


export const MetaMaskContext = createContext<MetamaskContext | undefined>(undefined);

export const MetaMaskProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  /* const { activate, account, library, connector, active, deactivate } = useWeb3React() */
  const [ runInitialization, setRunInitialization ] = useState(false);
  const [ account, setAccount ] = useState('');
  const [ balance, setBalance ] = useState(0);
  const [ chain, setChain ] = useState(0);
  const [ isActive, setIsActive ] = useState(false);
  const [ isLoading, setIsLoading ] = useState(true);
  const [ contract, setContract ] = useState<ISimpleDCATask>(new ethers.Contract(DCA_CONTRACT_ADDRESS, SimpleDCATask.abi, provider) as ISimpleDCATask);
  const [ hasWrongChainError, setHasWrongChainError ] = useState(false);
  // snackbar state
  const [ open, setOpen ] = useState(false);
  const [ snackbarSeverity, setSnackbarSeverity ] = useState('info');
  const [ snackbarText, setSnackbarText ] = useState('');
  const [ hasOngoingTransaction, setHasOngoingTransaction ] = useState(false);


  const getPoolFee = async () => {
    const fee = await contract.POOL_FEE();
    return fee;
  };

  const getContractVariables = async () => {
    const maxInvestments = await contract.MAX_INVESTMENTS();
    const poolFee = await contract.POOL_FEE();
    const maxInvestmentTIme = await contract.MAX_INVESTMENT_TIME();
    const minInvestmentTIme = await contract.MIN_INVESTMENT_TIME();
  }

  const subscribeTx = async (tx: ContractTransaction) => {
    try {
      const result = await tx.wait();
      setHasOngoingTransaction(false);
      setOpen(false);
      const etherscan = `https://goerli.etherscan.io/tx`;
      setSnackbarSeverity('success');
      setSnackbarText(`Transaction Successfull... ${result.confirmations} Confirmations\nSee details: ${etherscan}/${result.transactionHash}`);
      setOpen(true);
      return true;
    } catch (err) {
      setHasOngoingTransaction(false);
      setOpen(false);
      setSnackbarSeverity('error');
      setSnackbarText(`Transaction Errored... See more: ${JSON.stringify(err)}`);
      setOpen(true);
      return false;
    };
  }

  const wrapEth = async (amount: number) => {
    const options = { value: ethers.utils.parseEther(`${amount}`) };
    try {
      setHasOngoingTransaction(true);
      const tx = await contract.wrapEth(options);
      setSnackbarSeverity('info');
      setSnackbarText(`Wrap ethereum called... txHash: ${tx.hash}`);
      setOpen(true);
      const result = await subscribeTx(tx);
      return result;
    } catch (error) {
      setHasOngoingTransaction(false);
      setOpen(false);
      setSnackbarSeverity('error');
      setSnackbarText(`Transaction Errored... See more: ${JSON.stringify(error)}`);
      setOpen(true);
      return false;
    }
  }

  const connect = async () => await provider.send("eth_requestAccounts", []);

  const changeChain = async () => {
    try {
      // check if the chain to connect to is installed
      await provider.send('wallet_switchEthereumChain',[{ chainId: '0x5' }]); // chainId must be in hexadecimal numbers
    } catch (error: any) {
      // This error code indicates that the chain has not been added to MetaMask
      // if it is not, then install it into the user MetaMask
      if (error.code === 4902) {
        try {
          await provider.send('wallet_addEthereumChain', [{
            chainId: "0x5",
            rpcUrls: ["https://goerli.prylabs.net/"],
            chainName: "Goerli test network",
            nativeCurrency: {
                name: "GoerliEth",
                symbol: "GoerliETH",
                decimals: 18
            },
            blockExplorerUrls: ["https://goerli.etherscan.io/"] 
          }]);
        } catch (addError) {
          setOpen(false);
          setSnackbarSeverity('error');
          setSnackbarText(`Could not add Goerli chain... See more: ${JSON.stringify(addError)}`);
          setOpen(true);
        }
      }
      setOpen(false);
      setSnackbarSeverity('error');
      setSnackbarText(`Could not switch to Goerli chain... See more: ${JSON.stringify(error)}`);
      setOpen(true);
    }
  }

  const addToken = async (tokenSymbol: string) => {
    let tokenAddress;
    switch (tokenSymbol) {
      case 'WETH':
        tokenAddress = WETH_GOERLI_ADDRESS;
        break;
      case 'USDC':
        tokenAddress = USDC_GOERLI_ADDRESS;
        break;
      case 'WBTC':
        tokenAddress = WBTC_GOERLI_ADDRESS;
        break;
      default:
        return;
    }
    const decimals = await ((new ethers.Contract(tokenAddress, ERC20, provider) as any).decimals());
    if (!tokenAddress) {
      setOpen(false);
      setSnackbarSeverity('error');
      setSnackbarText(`Token '${tokenSymbol}' is not available to add.`);
      setOpen(true);
      return;
    }
    const logo = getLogoUrl(getAddress(tokenAddress));
    const options: WatchAssetParams = { type: 'ERC20', options: { address: tokenAddress, symbol: tokenSymbol, decimals, image: logo }};
    const wasAdded = await provider.send(
      'wallet_watchAsset',
      [ options ]
    );
  
    if (wasAdded) {
      setOpen(false);
      setSnackbarSeverity('success');
      setSnackbarText(`'${tokenSymbol}' Added Successfully.`);
      setOpen(true);
    } else {
      setOpen(false);
      setSnackbarSeverity('error');
      setSnackbarText(`Could not Add '${tokenSymbol}'.`);
      setOpen(true);
    }
  }

  const swapForUsdc = async (amount: number) => {
    const signer = provider.getSigner(account);
    const wethContract: IERC20 = new ethers.Contract(WETH_GOERLI_ADDRESS, ERC20, signer) as IERC20;
    const decimals = await (wethContract as any).decimals();
    const value = ethers.utils.parseUnits(`${amount}`, decimals);
    const allowance = await wethContract.allowance(account, contract.address);
    if (allowance < value) {
      const tx = await wethContract.approve(contract.address, value);
      setHasOngoingTransaction(true);
      setSnackbarSeverity('info');
      setSnackbarText(`Approving WETH... txHash: ${tx.hash}`);
      setOpen(true);
      subscribeTx(tx);
      const tempResult = await tx.wait();
      if (!tempResult) return false;
      setOpen(false);
    }
    
    const secondTx = await contract.swapWETHtoUSDC(value);
    setHasOngoingTransaction(true);
    setSnackbarSeverity('info');
    setSnackbarText(`Swap 'WETH' for 'USDC' called... txHash: ${secondTx.hash}`);
    setOpen(true);
    const result = await subscribeTx(secondTx);
    return result;
  }

  const approve = async (tokenSymbol: string, amount: number) => {
    let erc20Contract;
    const signer = provider.getSigner(account);
   
    switch (tokenSymbol) {
      case 'WETH':
        erc20Contract = new ethers.Contract(WETH_GOERLI_ADDRESS, ERC20, signer) as IERC20;
        break;
      case 'USDC':
        erc20Contract = new ethers.Contract(USDC_GOERLI_ADDRESS, ERC20, signer) as IERC20;
        break;
      case 'WBTC':
        erc20Contract = new ethers.Contract(WBTC_GOERLI_ADDRESS, ERC20, signer) as IERC20;
        break;
      default:
        return false;
    }

    if (!contract) {
      setOpen(false);
      setSnackbarSeverity('error');
      setSnackbarText(`'${tokenSymbol} Not Supported.`);
      setOpen(true);
      return false;
    }
    const decimals = await (erc20Contract as any).decimals();
    const value = ethers.utils.parseUnits(`${amount}`, decimals)
    const tx = await erc20Contract.approve(contract.address, value);

    setHasOngoingTransaction(true);
    setSnackbarSeverity('info');
    setSnackbarText(`Approve '${tokenSymbol}' called... txHash: ${tx.hash}`);
    setOpen(true);
    const result = await subscribeTx(tx);
    return result;
  }

  const createTask = async (amount: number, duration: number, buyTokenSymbol: string) => {
    const allowedToken = [ 'WETH', 'USDC', 'WBTC' ].indexOf(buyTokenSymbol) !== -1;
    
    if (!allowedToken) {
      setOpen(false);
      setSnackbarSeverity('error');
      setSnackbarText(`'${allowedToken} Not Supported.`);
      setOpen(true);

      return false;
    };
    const signer = provider.getSigner(account);
    const usdcContract = new ethers.Contract(USDC_GOERLI_ADDRESS, ERC20, signer) as IERC20;
    const decimals = await (usdcContract as any).decimals();
    const value = ethers.utils.parseUnits(`${amount}`, decimals);
    const allowance = await usdcContract.allowance(account, contract.address);
    if (allowance.gte(value)) {
      setHasOngoingTransaction(true);
      const tx = await contract.createTask(value, buyTokenSymbol, duration);
      setSnackbarSeverity('info');
      setSnackbarText(`Create Task called... txHash: ${tx.hash}`);
      setOpen(true);
      const result = await subscribeTx(tx);
      return result;
    } else {
      setSnackbarSeverity('error');
      setSnackbarText(`User has not allowed the necessary amount of USDC`);
      setOpen(true);
      return false;
    }
  }

  const balanceOf = async (tokenSymbol: string) => {
    let erc20Contract;
    const signer = provider.getSigner(account);
    switch (tokenSymbol) {
      case 'WETH':
        erc20Contract = new ethers.Contract(WETH_GOERLI_ADDRESS, ERC20, signer) as IERC20;
        break;
      case 'USDC':
        erc20Contract = new ethers.Contract(USDC_GOERLI_ADDRESS, ERC20, signer) as IERC20;
        break;
      case 'WBTC':
        erc20Contract = new ethers.Contract(WBTC_GOERLI_ADDRESS, ERC20, signer) as IERC20;
        break;
      case 'DAI':
        erc20Contract = new ethers.Contract(DAI_GOERLI_ADDRESS, ERC20, signer) as IERC20;
        break;
      default:
        return 0;
    }

    const balance = await erc20Contract.balanceOf(account);
    return ethers.utils.parseUnits(`${balance}`, 0).toNumber();
  }

  const depositFunds = async (amount: number) => {
    const tx = await contract.deposit({ value: ethers.utils.parseEther(`${amount}`)});
    setHasOngoingTransaction(true);
    setSnackbarSeverity('info');
    setSnackbarText(`Depositing Ether to contract... txHash: ${tx.hash}`);
    setOpen(true);
    subscribeTx(tx);
  }

  useEffect(() => {
    window.ethereum.on('chainChanged', async (chainId: number) => {
      if (chainId !== 5) {
        setAccount('');
        setBalance(0);
        setHasWrongChainError(true);
      }
    });

    window.ethereum.on('accountsChanged', async (accounts: string[]) => {
      console.log('accountsChanged');
      if (!accounts[0]) {
        setAccount('');
        setBalance(0);
        return;
      }
      const chainId = await provider.send('eth_chainId', []);
      if (chainId !== 5) {
        await changeChain();
      }
      setAccount(accounts[0]);
      const balance = await provider.getBalance(accounts[0]);
      const balanceInEther = ethers.utils.formatEther(balance);
      setBalance(parseFloat(parseFloat(balanceInEther).toFixed(3)));
      const signer = provider.getSigner(accounts[0]);
      setContract(contract.connect(signer));
    });
  
    window.ethereum.on('connect', async (event: { chainId: string}) => {
      if (event.chainId !== '0x5') {
        await changeChain();
      }
      // force re-setting account;
      const [ account ] = await provider.send('eth_accounts', []);
      setAccount(account);
      const balance = await provider.getBalance(account);
      const balanceInEther = ethers.utils.formatEther(balance);
      setBalance(parseFloat(parseFloat(balanceInEther).toFixed(3)));
      const signer = provider.getSigner(account);
      setContract(contract.connect(signer));
    })
  
    window.ethereum.on('disconnect', async () => {
      console.log('disconnect');
      setAccount('');
      setBalance(0);
    });

    connect();

    return () => {
      // cleanup subscriptions;
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
      window.ethereum.removeAllListeners('connect');
      window.ethereum.removeAllListeners('disconnect');
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    setSnackbarText('');
  };

  const getInvestments = async () => {
    const tx = await contract.getOwnInvestments();
    const signer = provider.getSigner(account);
    const usdcContract = new ethers.Contract(USDC_GOERLI_ADDRESS, ERC20, signer);
    const decimals = await (usdcContract as any).decimals();
    const result = await tx;
    console.log(result);
    console.log(result.map((el) => {
      const avgAmount = ethers.utils.parseUnits(`${el[1].toNumber()}`, decimals).toNumber();
      const expiryTimestamp = el[2].toNumber();
      return {
        symbol: el[0], avgBuy: avgAmount, expiry: expiryTimestamp
      }
    }));
  }

  return (
    <MetaMaskContext.Provider value={{
        account,
        balance,
        chain,
        connect,
        hasWrongChainError,
        getPoolFee,
        wrapEth,
        getContractVariables,
        addToken,
        swapForUsdc,
        approve,
        createTask,
        getInvestments,
        depositFunds,
        hasOngoingTransaction,
        balanceOf,
      }}>
      {children}
      <Snackbar
        open={open}
        onClose={handleClose}
        TransitionComponent={TransitionLeft}
      >
        {
          snackbarSeverity === 'success' ?
            <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
              { snackbarText}
            </Alert>
            : snackbarSeverity === 'error' ?
              <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
                { snackbarText}
              </Alert>
              : <Alert onClose={handleClose} severity="info" sx={{ width: '100%' }}>
                { snackbarText}
              </Alert>
        }
      </Snackbar>
    </MetaMaskContext.Provider>
  );
}

export const useMetaMask = () => {
  const context = useContext(MetaMaskContext)

  if (context === undefined) {
    throw new Error('useMetaMask hook must be used with a MetaMaskProvider component')
  }

  return context
}
