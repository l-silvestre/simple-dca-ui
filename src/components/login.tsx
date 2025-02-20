import { DialogTitle, DialogContent, DialogActions, List, Typography, Avatar, ListItem, ListItemAvatar, ListItemText, Tooltip } from "@mui/material";
import { Dispatch, SetStateAction, useCallback, useContext, useState } from "react";
import { EVMWalletContext } from "@context/evm";
import { motion } from "motion/react"
import { EIP6963ProviderDetail } from "@interfaces/evm";
import { useLocalStorage } from "@hooks/useLocalStorage";
import { enqueueSnackbar } from "notistack";
import StyledDialog from "./dialog";

// icons
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
import WalletRoundedIcon from '@mui/icons-material/WalletRounded';
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckCircle from '@mui/icons-material/CheckCircle';
import StyledButton from "./button";

const DialogConfirmUntestedWallet = ({
  open,
  setOpen,
  provider,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  provider: EIP6963ProviderDetail;
}) => {
  const handleClose = useCallback(() => setOpen(false), [setOpen]);

  const { connect } = useContext(EVMWalletContext);
  const { localStorageValue: currentProviderValue } = useLocalStorage('evmProvider');
  const { updateStorageValue: updateHasOnboarded } = useLocalStorage('hasOnboarded');

  const handleEvmConnect = useCallback(async () => {
    await connect(provider);
    updateHasOnboarded('true');
    setOpen(false);
  }, [ provider, connect, updateHasOnboarded, setOpen]);

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      maxWidth={'sm'}
      fullWidth
      slotProps={{
        paper: {
          elevation: 24,
        }
      }}
    >
      <DialogTitle>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '22px',
          }}
          className='flex items-center gap-2 pb-4'
        >
          <WalletRoundedIcon />
          {'Connecting different wallets'}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <div className='font-regular px-2 pb-2'>
          You are about to connect an untested wallet.
          <br /> <br />
          <strong>
            While we expect everything to work correctly, we cannot test every aspect with every
            wallet, so we cannot guarantee that every feature will function as expected. It&apos;s
            also possible that some wallets may require additional configuration to work seamlessly
            with our app.
          </strong>
          <br /> <br />
          If something doesn&apos;t quite work as expected, or if you have any questions, feel free
          to contact us through our social media channels.
        </div>
      </DialogContent>
      <DialogActions
        sx={{
          display: 'flex',
          justifyContent: 'center',
          paddingBottom: '20px',
          gap: '10px',
        }}
      >
        <StyledButton
          onClick={handleClose}
          className='plausible-event-name=Connect+WarningUntestedWallet+Popup+Cancelled secondary'
        >
          <div className='flex items-center gap-2'>
            <HighlightOffRoundedIcon /> Cancel
          </div>
        </StyledButton>
        <StyledButton
          onClick={handleEvmConnect}
          disabled={currentProviderValue === provider.info.name}
          className='plausible-event-name=Connect+WarningUntestedWallet+Popup+Agreed+Connect primary'
        >
          <div className='flex items-center gap-2'>
            <CheckCircle />
            Agree and connect
          </div>
        </StyledButton>
      </DialogActions>
    </StyledDialog>
  );
};

const ProviderElement = ({
  provider,
  setOpen,
  isRecommendedWallet,
  setOpenDialogWarningUntestedWallet,
}: {
  provider: EIP6963ProviderDetail;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setOpenDialogWarningUntestedWallet?: Dispatch<SetStateAction<boolean>>;
  isRecommendedWallet: boolean;
}) => {
  const { connect } = useContext(EVMWalletContext);
  const { localStorageValue: currentProviderValue } = useLocalStorage('evmProvider');
  const { updateStorageValue: updateHasOnboarded } = useLocalStorage('hasOnboarded');

  const handleEvmConnect = useCallback(async () => {
    await connect(provider);
    updateHasOnboarded('true');
    setOpen(false);
  }, [provider, updateHasOnboarded, setOpen, connect]);

  const connectWallet = () => {
    handleEvmConnect();
  };

  const showPopupUntestedWallet = () => {
    if (setOpenDialogWarningUntestedWallet) {
      setOpenDialogWarningUntestedWallet(true);
    }
  };

  const [moreInfoWalletOpened, openMoreInfoWallet] = useState(false);

  return (
    <>
      <div className='rounded-3xl bg-slate-300 py-2 my-2'>
        {provider.info.name !== 'Rabby Wallet' && (
          <ListItem
            key={provider.info.uuid}
            sx={{ display: 'flex', flexWrap: 'wrap', gap: '15px 0px', justifyContent: 'center' }}
          >
            <ListItemAvatar>
              <Avatar
                src={provider.info.icon}
                alt='provider.info.name'
                className='p-[6px] object-contain bg-white'
              />
            </ListItemAvatar>
            <ListItemText primary={provider.info.name} />
            <StyledButton
              aria-label='Connect this wallet'
              onClick={isRecommendedWallet ? connectWallet : showPopupUntestedWallet}
              disabled={currentProviderValue === provider.info.name}
              className='plausible-event-name=EVM+Connected primary'
            >
              {currentProviderValue === provider.info.name ? 'Connected' : 'Connect'}
              <ExitToAppRoundedIcon style={{ width: '22px' }} />
            </StyledButton>
          </ListItem>
        )}

        {provider.info.name === 'Rabby Wallet' && (
          <>
            <ListItem
              key={provider.info.uuid}
              sx={{ display: 'flex', flexWrap: 'wrap', gap: '15px 0px', justifyContent: 'center' }}
            >
              <ListItemAvatar>
                <Avatar
                  src={provider.info.icon}
                  alt='provider.info.name'
                  className='p-[6px] object-contain bg-white'
                />
              </ListItemAvatar>
              <ListItemText primary={provider.info.name} />
              <StyledButton
                aria-label='Connect this wallet'
                onClick={() => {
                  openMoreInfoWallet(!moreInfoWalletOpened);
                }}
                className='plausible-event-name=EVM+Connected secondary'
              >
                {currentProviderValue === provider.info.name ? 'Connected' : 'More Info'}
                <KeyboardArrowDownRoundedIcon style={{ width: '22px' }} />
              </StyledButton>
            </ListItem>

            {moreInfoWalletOpened && (
              <motion.div
                initial={{ opacity: 0, padding: 0, y: '-60px', height: 0 }}
                animate={{
                  opacity: 1,
                  padding: '10px 30px',
                  height: 'max-content',
                  y: 0,
                  transition: {
                    duration: 0.2,
                  },
                }}
                className='flex flex-col gap-4'
              >
                <div className='font-semibold'>This wallet needs a few extra configurations:</div>
                <p>{'1. Click on the Rabby extension, and then click on "more".'}</p>
                <div className='w-full p-2 flex justify-center'>
                  <img
                    src='./wallet-instructions/rabby-1.jpg'
                    className='w-full max-w-[400px] rounded-3xl shadow-lg'
                  />
                </div>
                <p>{'2. In the settings section, click on the "Modify RPC URL" option.'}</p>
                <div className='w-full p-2 flex justify-center'>
                  <img
                    src='./wallet-instructions/rabby-2.jpg'
                    className='w-full max-w-[400px] rounded-3xl shadow-lg'
                  />
                </div>
                <p>
                  {
                    '3. Click on the "Modify RPC URL" option and then click on the "Arbitrum" network.'
                  }
                </p>
                <div className='w-full p-2 flex justify-center'>
                  <img
                    src='./wallet-instructions/rabby-3.jpg'
                    className='w-full max-w-[400px] rounded-3xl shadow-lg'
                  />
                </div>
                <p>
                  {'4. Add the URL '}
                  <StyledButton
                    /* text={'https://arb1.arbitrum.io/rpc'} */
                    onClick={() => {
                      navigator.clipboard.writeText('https://arb1.arbitrum.io/rpc');
                      enqueueSnackbar('Copied to clipboard.', {
                        variant: 'success',
                        autoHideDuration: 2000,
                        style: { fontWeight: 700 },
                      });
                    }}
                  >
                    <Tooltip title={'Click to copy'}>
                      <span className='cursor-pointer bg-slate-600 py-1 px-2 rounded-xl text-white hover:bg-slate-500'>
                        https://arb1.arbitrum.io/rpc
                        <ContentCopyRoundedIcon
                          style={{ width: '20px', marginLeft: '5px', marginBottom: '3px' }}
                        />
                      </span>
                    </Tooltip>
                  </StyledButton>
                  {' and click Save.'}
                </p>
                <div className='w-full p-2 flex justify-center'>
                  <img
                    src='./wallet-instructions/rabby-4.jpg'
                    className='w-full max-w-[400px] rounded-3xl shadow-lg'
                  />
                </div>
                <p>
                  <strong>Note: </strong> It may be necessary to clear the cache (CTRL+SHIFT+R) to
                  apply the changes.
                </p>

                <div className='flex justify-end pb-3'>
                  <StyledButton
                    aria-label='Connect this wallet'
                    onClick={handleEvmConnect}
                    disabled={currentProviderValue === provider.info.name}
                    className='plausible-event-name=EVM+Connected primary'
                  >
                    {currentProviderValue === provider.info.name
                      ? 'Connected'
                      : 'Confirm and Connect'}
                    <ExitToAppRoundedIcon style={{ width: '22px' }} />
                  </StyledButton>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </>
  );
};

const InstallMetaMaskElement = () => {
  const installWallet = () => {
    window.open('https://metamask.io/download/', '_blank', 'noopener');
  };

  return (
    <div className='rounded-3xl bg-slate-300 py-2 my-2'>
      <ListItem
        sx={{ display: 'flex', flexWrap: 'wrap', gap: '15px 0px', justifyContent: 'center' }}
      >
        <ListItemAvatar>
          <Avatar src={'./icons/metamask.svg'} className='p-[6px] object-contain bg-white' />
        </ListItemAvatar>
        <ListItemText primary={'MetaMask'} />
        <StyledButton
          aria-label='Install this wallet'
          onClick={installWallet}
          className='plausible-event-name=EVM+Connected secondary'
        >
          Install
          <OpenInNewRoundedIcon style={{ width: '22px' }} />
        </StyledButton>
      </ListItem>
    </div>
  );
};

const InstallRabbyElement = () => {
  const installWallet = () => {
    window.open('https://rabby.io/', '_blank', 'noopener');
  };

  return (
    <div className='rounded-3xl bg-slate-300 py-2 my-2'>
      <ListItem
        sx={{ display: 'flex', flexWrap: 'wrap', gap: '15px 0px', justifyContent: 'center' }}
      >
        <ListItemAvatar className='rounded-full overflow-hidden'>
          <Avatar src={'./icons/rabby-wallet.png'} className='object-contain bg-white' />
        </ListItemAvatar>
        <ListItemText primary={'Rabby Wallet'} />
        <StyledButton
          aria-label='Install this wallet'
          onClick={installWallet}
          className='plausible-event-name=EVM+Connected secondary'
        >
          Install
          <OpenInNewRoundedIcon style={{ width: '22px' }} />
        </StyledButton>
      </ListItem>
    </div>
  );
};

const Login = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  // components/layout.js
  const { providers } = useContext(EVMWalletContext);
  const handleClose = useCallback(() => setOpen(false), [setOpen]);
  const [dialogWarningUntestedWallet, switchWarningDialogState] = useState(false);

  const metaMaskProviderFound = providers.find((provider) => provider.info.name === 'MetaMask');
  const rabbyProviderFound = providers.find((provider) => provider.info.name === 'Rabby Wallet');

  return (
    <>
      <StyledDialog
        open={open}
        onClose={handleClose}
        maxWidth={'sm'}
        fullWidth
        slotProps={{
          paper: {
            elevation: 24,
          }
        }}
      >
        <DialogTitle>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '22px',
            }}
            className='flex items-center gap-3 pb-4'
          >
            <WalletRoundedIcon />
            {'Connect your wallet'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <motion.div
            initial={{ x: '-20px', opacity: 0 }}
            animate={{ x: 0, opacity: 1, transition: { duration: 0.4 } }}
          >
            {providers.length >= 0 && (
              <List>
                <div className='font-semibold font-xl'>Our top recommended wallets</div>
                {metaMaskProviderFound && (
                  <ProviderElement
                    provider={metaMaskProviderFound}
                    key={metaMaskProviderFound.info.uuid}
                    setOpen={setOpen}
                    isRecommendedWallet={true}
                  />
                )}
                {rabbyProviderFound && (
                  <ProviderElement
                    provider={rabbyProviderFound}
                    key={rabbyProviderFound.info.uuid}
                    setOpen={setOpen}
                    isRecommendedWallet={true}
                  />
                )}
                {!metaMaskProviderFound && <InstallMetaMaskElement />}
                {!rabbyProviderFound && <InstallRabbyElement />}
                {providers.find(
                  (provider) =>
                    provider.info.name !== 'MetaMask' && provider.info.name !== 'Rabby Wallet',
                ) && (
                  <>
                    <div className='font-semibold font-xl mt-8'>
                      Other wallets we found installed
                    </div>
                    {providers
                      .filter(
                        (provider) =>
                          provider.info.name !== 'MetaMask' &&
                          provider.info.name !== 'Rabby Wallet',
                      )
                      .map((provider) => (
                        <div key={provider.info.uuid}>
                          <DialogConfirmUntestedWallet
                            open={dialogWarningUntestedWallet}
                            setOpen={switchWarningDialogState}
                            provider={provider}
                          />
                          <ProviderElement
                            provider={provider}
                            key={provider.info.uuid}
                            setOpen={setOpen}
                            isRecommendedWallet={false}
                            setOpenDialogWarningUntestedWallet={switchWarningDialogState}
                          />
                        </div>
                      ))}
                  </>
                )}
              </List>
            )}
          </motion.div>
        </DialogContent>
        <DialogActions
          sx={{
            display: 'flex',
            justifyContent: 'center',
            paddingBottom: '20px',
          }}
        >
          <StyledButton
            onClick={handleClose}
            className='plausible-event-name=Connect+Popup+Closed secondary'
          >
            <div className='flex items-center gap-2'>
              <HighlightOffRoundedIcon /> Cancel
            </div>
          </StyledButton>
        </DialogActions>
      </StyledDialog>
    </>
  );
};

export default Login;