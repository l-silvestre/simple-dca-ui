import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import { useCallback, useContext, useState } from 'react';
import { EVMWalletContext } from '@context/evm';
import { Button, IconButton } from '@mui/material';
import WalletDetails from './wallet-details';
import Login from './login';
import { MenuRounded } from '@mui/icons-material';

const AddressParser = ({ address }: { address: string}) => {
  if (!address) {
    return <Typography variant="h6" noWrap component="div">{''}</Typography>;
  }

  return <Typography variant="h6" noWrap component="div">{address.slice(0, 6)}...{address.slice(-4)}</Typography>;
};

const Header = () => {
  const { currentAddress } = useContext(EVMWalletContext);
  const [ open, setOpen ] = useState(false);
  const [ openLogin, setOpenLogin ] = useState(false);

  const handleButtonClick = useCallback(() => {
    if (currentAddress) {
      setOpen(curr => !curr);
    } else {
      // open login
      setOpenLogin(true);
    }
  }, [ currentAddress, setOpen ]);


  return <>
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ display: 'flex', gap: '8px' }}>
        <IconButton>
          <MenuRounded />
        </IconButton>
        <Typography variant="h6" noWrap component="div">
          Simple DCA
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button sx={{ flexGrow: 0, borderRadius: 32 }} variant="outlined" color='secondary' onClick={handleButtonClick}>
          {currentAddress && <AddressParser address={currentAddress} />}
          {!currentAddress && <Typography variant="h6" noWrap component="div">Login</Typography>}
        </Button>
      </Toolbar>
      <WalletDetails open={open} setOpen={setOpen} />
    </AppBar>
    <Login open={openLogin} setOpen={setOpenLogin} />
  </>;
};

export default Header;