import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Button from '@mui/material/Button';
import { useContext, useEffect, useState } from 'react';
import { Web3Context } from '../web3Context';
import { ethers } from 'ethers';
import { Box, Container } from '@mui/material';

export const Metamask = () => {
  const ethereum = useContext(Web3Context)!;
  const [ isConnected, setIsConnected ] = useState(false);
  const [ address, setAddress ] = useState(undefined);
  const [ balance, setBalance ] = useState(0);
  const [ chain, setChain ] = useState(0);

  const connectToMetamask = async () => {
    const accounts = await ethereum.send("eth_requestAccounts", []);
    const chain = await ethereum.send('eth_chainId', []) as string;
    const chainId = ethers.utils.formatBytes32String(chain);
    const balance = await ethereum.getBalance(accounts[0]);
    const balanceInEther = ethers.utils.formatEther(balance);
    setAddress(accounts[0]);
    setBalance(parseInt(balanceInEther));
    setChain(parseInt(chainId));
    setIsConnected(true);
    // const block = await ethereum.getBlockNumber();
  
    /* provider.on("block", (block) => {
      this.setState({ block })
    }) */
  
    /* const daiContract = new ethers.Contract('0x6b175474e89094c44da98b954eedeac495271d0f', abi, provider);
    const tokenName = await daiContract.name();
    const tokenBalance = await daiContract.balanceOf(accounts[0]);
    const tokenUnits = await daiContract.decimals();
    const tokenBalanceInEther = ethers.utils.formatUnits(tokenBalance, tokenUnits); */
  };

  useEffect(() => {
    const asyncFn = async () => await connectToMetamask();
    asyncFn();
  });

  const handleClick = () => setIsConnected(true);

  return (
    <Box>
      {
        isConnected ?
        <Button endIcon={<AccountBalanceWalletIcon />} onClick={handleClick}>Connect Wallet</Button> :
        <Container>
          <p>{address}</p>
          <p>{balance}</p>
          <p>{chain}</p>
        </Container>
      }
    </Box>
  );
}

// 