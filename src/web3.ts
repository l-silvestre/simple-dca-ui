import { ethers } from "ethers";
import { abi } from "./IERC20.json";

const provider = new ethers.providers.Web3Provider(window.ethereum);

export const getChain = async () => {
  console.log(provider.network.chainId.toFixed());
  const chainId = await provider.send('eth_chainId', []);
  
  console.log(chainId);
}

export const connectToMetamask = async () => {
  const accounts = await provider.send("eth_requestAccounts", []);
  const balance = await provider.getBalance(accounts[0]);
  const balanceInEther = ethers.utils.formatEther(balance);
  const block = await provider.getBlockNumber();

 /*  provider.on("block", (block) => {
    this.setState({ block })
  })

  const daiContract = new ethers.Contract('0x6b175474e89094c44da98b954eedeac495271d0f', abi, provider);
  const tokenName = await daiContract.name();
  const tokenBalance = await daiContract.balanceOf(accounts[0]);
  const tokenUnits = await daiContract.decimals();
  const tokenBalanceInEther = ethers.utils.formatUnits(tokenBalance, tokenUnits);

  this.setState({ selectedAddress: accounts[0], balance: balanceInEther, block, tokenName, tokenBalanceInEther }) */
};

provider.on('accountsChanged', () => {
  console.log('accountsChanged')
});

provider.on('network', (curr, prev) => {
  console.log('curr: ', curr);
  console.log('prev: ', prev);
});

