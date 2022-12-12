import { ethers } from 'ethers';
import { createContext } from 'react';
import { abi } from './IERC20.json';


export const Web3Context = createContext<ethers.providers.Web3Provider | undefined>(undefined);

export const Web3Provider = Web3Context.Provider;

/* const checkWalletConnected = async () => {
  const accounts = await ethereum.send('eth_accounts', []);
  return accounts.length === 0;
}; */


/* const changeToGoerli = () => {
  ethereum.send('wallet_addEthereumChain', [{
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
} */

/* const checkGoerliChain = async () => {
  const chainId = await ethereum.send('eth_chainId', []) as string;
  
  return chainId === '0x5';
} */

/* const connectToMetamask = async () => {
  const accounts = await ethereum.send("eth_requestAccounts", []);
  const balance = await ethereum.getBalance(accounts[0]);
  const balanceInEther = ethers.utils.formatEther(balance);
  const block = await ethereum.getBlockNumber();

   provider.on("block", (block) => {
    this.setState({ block })
  })

  const daiContract = new ethers.Contract('0x6b175474e89094c44da98b954eedeac495271d0f', abi, provider);
  const tokenName = await daiContract.name();
  const tokenBalance = await daiContract.balanceOf(accounts[0]);
  const tokenUnits = await daiContract.decimals();
  const tokenBalanceInEther = ethers.utils.formatUnits(tokenBalance, tokenUnits);

  this.setState({ selectedAddress: accounts[0], balance: balanceInEther, block, tokenName, tokenBalanceInEther }) 
};
*/

/* provider.on('accountsChanged', () => {
  console.log('accountsChanged')
});

provider.on('network', (curr, prev) => {
  console.log('curr: ', curr);
  console.log('prev: ', prev);
});
 */


