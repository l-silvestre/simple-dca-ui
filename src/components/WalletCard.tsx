import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

declare global {
  interface Window {
      ethereum: any;
  }
}

const WalletCard = () => {
  const [haveMetamask, sethaveMetamask] = useState(true);
  const [accountAddress, setAccountAddress] = useState('');
  const [accountBalance, setAccountBalance] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [accountLogo, setAccountLogo] = useState('');
  const [currentNetwork, setNetwork] = useState('');

  const { ethereum } = window;
  const logo = 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg';
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  useEffect(() => {
    const { ethereum } = window;
    const checkMetamaskAvailability = async () => {
      if (!ethereum) {
        sethaveMetamask(false);
      }
      sethaveMetamask(true);
    };
    checkMetamaskAvailability();
  }, []);

  const connectWallet = async () => {
    try {
      if (!ethereum) {
        sethaveMetamask(false);
      }
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      let balance = await provider.getBalance(accounts[0]);
      // let logo = await provider.getAvatar(accounts[0]) || '';
      let logo = await provider.getAvatar("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48") || '';
      let ens = await provider.lookupAddress("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48");
      console.log(ens);
      console.log(logo);
      let network = (await provider.getNetwork())?.name || '';
      setNetwork(network);
      setAccountLogo(logo);
      let bal = ethers.utils.formatEther(balance);
      setAccountAddress(accounts[0]);
      setAccountBalance(bal);
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        {haveMetamask ? (
          <div className="App-header">
            {isConnected ? (
              <div className="card">
                <div className="card-row">
                  <h3>Wallet Address:</h3>
                  { accountLogo && <img src={accountLogo} className="App-logo" alt="logo" />}
                  <p>
                    {accountAddress.slice(0, 4)}...
                    {accountAddress.slice(38, 42)}
                  </p>
                </div>
                <div className="card-row">
                  <h3>Wallet Balance:</h3>
                  <p>{accountBalance}</p>
                </div>
              </div>
            ) : (
              <img src={logo} className="App-logo" alt="logo" />
            )}
            {isConnected ? (
              <p className="info">🎉 Connected Successfully</p>
            ) : (
              <button className="btn" onClick={connectWallet}>
                Connect
              </button>
            )}
          </div>
        ) : (
          <p>Please Install MetaMask</p>
        )}
      </header>
    </div>
  );
}

export default WalletCard;