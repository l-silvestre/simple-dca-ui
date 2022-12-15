import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Button from '@mui/material/Button';
import { Box, Container } from '@mui/material';
import { useMetaMask } from '../hooks/useMetamask';

export const Metamask = () => {
  const { account, balance, chain, connect} = useMetaMask();

  return (
    <Box>
      {
        !account  || (account === '') ?
        <Button endIcon={<AccountBalanceWalletIcon />} onClick={connect}>Connect Wallet</Button> :
        <Container>
          <p>{account.slice(0, 2)}...{account.slice(-4)} {balance} ETH</p>
        </Container>
      }
    </Box>
  );
}

// 