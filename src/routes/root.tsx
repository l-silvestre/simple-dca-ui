import Header from "../components/Header";
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Outlet, useNavigate } from "react-router-dom";
import { Container } from "@mui/material";
import GitHubIcon from '@mui/icons-material/GitHub';
import { MutableRefObject, useEffect, useRef, useState } from "react";

const drawerWidth = 240;

export const Root = () => {
  // const outletElement = useOutlet(null);
  const [ selectedRoute, setSelectedRoute ] = useState('dashboard');
  const navigate = useNavigate();

  const handleListItemClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    route: string,
  ) => {
    setSelectedRoute(route);
    navigate(route);
  };

  const [drawerContentHeight, setDrawerContentHeight] = useState(0);
  const ref = useRef() as MutableRefObject<HTMLDivElement>;

  useEffect(() => {
    setDrawerContentHeight(ref.current.clientHeight);
  }, [])


  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Header />
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', flexGrow: 1}}>
          <List>
            <ListItemButton
              selected={selectedRoute === 'dashboard'}
              onClick={(event) => handleListItemClick(event, 'dashboard')}
            >
              <ListItemText primary='Dashboard' />
            </ListItemButton>
            <ListItemButton
              selected={selectedRoute === 'invest'}
              onClick={(event) => handleListItemClick(event, 'invest')}
            >
              <ListItemText primary='Invest' />
            </ListItemButton>
            <ListItemButton
              selected={selectedRoute === 'history'}
              onClick={(event) => handleListItemClick(event, 'history')}
            >
              <ListItemText primary='History'/>
            </ListItemButton>
            <ListItemButton
              selected={selectedRoute === 'stats'}
              onClick={(event) => handleListItemClick(event, 'stats')}
            >
              <ListItemText primary='Stats'/>
            </ListItemButton>
          </List>
          <div style={{flexGrow: 1}}/>
          <Divider />
          <Box sx={{ alignContent: 'center' }}>
            <List>
              <ListItem disableGutters={true}>
                <ListItemIcon>
                  <GitHubIcon />
                </ListItemIcon>
                <ListItemText>
                  github
                </ListItemText>
              </ListItem>
            </List>
          </Box>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Container ref={ref}>
          <Toolbar />
          <Outlet context={drawerContentHeight}/>
        </Container>
      </Box>
    </Box>
  );
}