import { EVMWalletContext } from "@context/evm";
import { OpenInNew } from "@mui/icons-material";
import { Box, Button, Card, CardContent, CardHeader, ClickAwayListener, Divider, Drawer, IconButton, ToggleButton, ToggleButtonGroup, toggleButtonGroupClasses, Typography, useTheme } from "@mui/material";
import { SyntheticEvent, useContext, useRef, useState } from "react";

// icons
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import SettingsIcon from '@mui/icons-material/Settings';
import ActivityList from "./activity-list";
import useScroll from "@hooks/useScroll";
import { motion } from "motion/react";
import Balances from "./balances";

const WalletDetails = ({ open, setOpen }: { open: boolean, setOpen: (status: boolean) => void }) => {
  const theme = useTheme();
  const { currentAddress, disconnect } = useContext(EVMWalletContext);

  const anchorRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null)

  const { isTop } = useScroll(scrollRef);
  const [ tab, setTab ] = useState<'tokens' | 'activity'>('tokens');

  const handleDisconnect = () => {
    disconnect();
    setOpen(false);
  };

  const handleViewInExplorer = () => {
    window.open(`https://etherscan.io/address/${currentAddress}`, '_blank');
  };

  const handleClose = (event: Event | SyntheticEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }

    setOpen(false);
  };

  const handleChange = (_: React.MouseEvent<HTMLElement>, newValue: 'tokens' | 'activity') => {
    if (newValue !== null) {
      // setChartData(undefined);
      setTab(newValue);
    }
  };

  return <Drawer
    open={open}
    anchor='right'
    onClose={setOpen}
    /* hideBackdrop */
    slotProps={{
      backdrop: {
        sx: { zIndex: (theme) => theme.zIndex.drawer + 10 },
      }
    }}
    ModalProps={{
      sx: { zIndex: (theme) => theme.zIndex.drawer + 10 },
    }}
    PaperProps={{
      elevation: 24,
      sx: {
        height: '95%',
        width: '300px',
        borderRadius: '32px',
        margin: '12px',
        zIndex: (theme) => theme.zIndex.drawer + 10,
      },
    }}
  >
      <ClickAwayListener onClickAway={handleClose}>
        <Card variant='outlined' sx={{ height: '100%', borderRadius: '32px' }}>
          {currentAddress !== '' && (
            <>
              <CardHeader
                avatar={<>
                  <IconButton onClick={handleDisconnect}>
                    <SettingsIcon />
                  </IconButton>
                  <IconButton onClick={handleDisconnect}>
                    <PowerSettingsNewIcon />
                  </IconButton>
                </>}
                subheader={'Connected Account'}
                title={
                  <Typography
                    fontWeight={500}
                    sx={{
                      textDecoration: 'underline',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      cursor: 'pointer',
                    }}
                    onClick={handleViewInExplorer}
                  >
                    {`${currentAddress.slice(0, 6)}...${currentAddress.slice(-4)}`}
                    <OpenInNew fontSize='inherit' />
                  </Typography>
                }
                sx={{
                  '&.MuiCardHeader-root': {
                    display: 'flex',
                    gap: '24px',
                    flexDirection: 'row-reverse',
                    justifyContent: 'space-between',
                  },
                  '& .MuiCardHeader-avatar': {
                    marginRight: 0,
                  },
                  '& .MuiCardHeader-content': {
                    display: 'flex',
                    flexDirection: 'column-reverse',
                  },
                }}
              />
              <CardContent  sx={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
                <Button variant="contained" sx={{ borderRadius: '32px'}} color="secondary">Buy</Button>
                <Button variant="contained" sx={{ borderRadius: '32px'}} color="secondary">Sell</Button>
              </CardContent>
              <CardContent
                sx={{ display: 'flex', flexDirection: 'column', padding: 0 }}
              >
                <ToggleButtonGroup
                  color="primary"
                  value={tab}
                  exclusive
                  defaultValue={'tokens'}
                  onChange={handleChange}
                  sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 10,
                    boxShadow: isTop || tab === 'tokens' ? 'none' : `0px 10px 15px 5px ${theme.palette.background.paper}`,
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    border: 'none',
                    [`& .${toggleButtonGroupClasses.grouped}`]: {
                      border: 'none',
                      borderRadius: '32px',
                      scale: 1,
                    },
                    '& .MuiToggleButton-root:hover': {
                      backgroundColor: 'transparent',
                    },
                    '& .MuiToggleButton-root.Mui-selected': {
                      backgroundColor: 'transparent',
                      scale: 1.2,
                    },
                    '& .MuiToggleButton-root.Mui-selected:hover': {
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  <ToggleButton value="tokens" color="secondary" disableRipple>Tokens</ToggleButton>
                  <ToggleButton value="activity" color="secondary" disableRipple>Activity</ToggleButton>
                </ToggleButtonGroup>
                <motion.div animate={{ opacity: tab === 'tokens' ? 1 : 0, x: tab === 'tokens' ? 0 : 250, height: tab === 'tokens' ? 'auto' : 0 }}>
                  <Balances />
                </motion.div>
                <motion.div animate={{ opacity: tab === 'activity' ? 1 : 0, x: tab === 'activity' ? 0 : 250, height: tab === 'activity' ? 'auto' : 0 }}>
                  <ActivityList scrollRef={scrollRef} />
                </motion.div>
                <Box  sx={{
                  zIndex: (theme) => theme.zIndex.drawer + 10,
                  boxShadow: tab === 'tokens' ? 'none' : `0px 0px 15px 15px ${theme.palette.background.paper}`,
                }}/>
              </CardContent>
              <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.05)' }} />
            </>
          )}
        </Card>
      </ClickAwayListener>
    </Drawer>;
};

export default WalletDetails;