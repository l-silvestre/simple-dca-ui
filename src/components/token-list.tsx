import { useCallback, useContext, useEffect, useState } from "react";
import { LineChart } from '@mui/x-charts/LineChart';
import { DatasetType } from "@mui/x-charts/internals";
import { Box, Card, IconButton, Stack, ToggleButton, ToggleButtonGroup, toggleButtonGroupClasses, Typography, useTheme } from "@mui/material";

// icons
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { timeframeOptions } from "@interfaces/alchemy";
import { motion, useAnimate } from "motion/react";
import { DEFAULT_Y_AXIS_KEY } from "@mui/x-charts";
import { ARBITRUM_CONTRACT_ADDRESSES } from "src/constants";
import { ArrowDownwardRounded, ArrowUpwardRounded } from "@mui/icons-material";
import { AlchemyCacheContext } from "@context/achemy-cache";

const Token = ({ tokenAddress }: { tokenAddress: string}) => {
  const theme = useTheme();
  const [ btnScope, animateBtn ] = useAnimate();
  const [ cardScope, animateCard ] = useAnimate();
  const { tokenUsdPrice, tokenPriceHistory, tokenInfo, fetchTokenPriceHistory, fetchTokenInfo } = useContext(AlchemyCacheContext);

  const [ chartData, setChartData ] = useState<DatasetType<number>>();
  const [ tab, setTab ] = useState<timeframeOptions>('1d');
  const [ symbol, setSymbol ] = useState<string>('');
  const [ logoUrl, setLogoUrl ] = useState<string>('');
  const [ isExpanded, setIsExpanded ] = useState(false);
  const [ priceVariation, setPriceVariation ] = useState<number>(0);
  const [ error, setError ] = useState<Error | null>(null);

  useEffect(() => {
    if (tokenInfo && tokenInfo[tokenAddress] && tokenPriceHistory[tokenAddress] && tokenPriceHistory[tokenAddress][tab]) {
      setChartData(tokenPriceHistory[tokenAddress][tab].map((price) => ({ x: new Date(price.timestamp).getTime(), y: price.value })));
      setSymbol(tokenInfo[tokenAddress].symbol);
      setLogoUrl(tokenInfo[tokenAddress].logo);
    }
  }, [ tokenAddress, tokenPriceHistory, tokenInfo, tab ]);

  // trigger fetch new info
  useEffect(() => {
    (async () => {
      try {
        await fetchTokenPriceHistory(tokenAddress, tab);
        await fetchTokenInfo(tokenAddress);
      } catch (error) {
        setError(error as unknown as Error);
      }
    })();
  }, [ fetchTokenInfo, fetchTokenPriceHistory, tokenAddress, tab ]);

  useEffect(() => {
    if (chartData) {
      const firstPrice = chartData[0].y;
      console.log('firstPrice', firstPrice);
      const lastPrice = chartData[chartData.length - 1].y;
      console.log('lastPrice', lastPrice);
      const variation = (lastPrice - firstPrice) / firstPrice * 100;
      console.log('variation', variation);
      setPriceVariation(variation);
    }
  }, [ chartData, tab, setPriceVariation ])

  const handleChange = (_: React.MouseEvent<HTMLElement>, newValue: timeframeOptions) => {
    if (newValue !== null) {
      // setChartData(undefined);
      setTab(newValue);
    }
  };

  const handleExpandClick = useCallback(() => {
    animateBtn(btnScope.current, { rotate: isExpanded ? 0 : 180 });
    animateCard(cardScope.current, { height: isExpanded ? 'initial' : 400 });
    setIsExpanded(!isExpanded);
  }, [ cardScope, btnScope, isExpanded, animateBtn, animateCard ]);

  if (error) {
    return <Card elevation={24} sx={{ borderRadius: '32px' }}>
      <Typography variant='h5' color='error'>{error.message}</Typography>
    </Card>
  }

  return <Card elevation={24} ref={cardScope} sx={{ borderRadius: '32px' }}>
    <motion.div layout transition={{
      type: "spring",
      visualDuration: 0.2,
      bounce: 0.2,
    }} style={{ display: 'flex', flexWrap: 'wrap', padding: '16px', gap: '8px', justifyContent: 'space-between', alignItems: isExpanded ? 'flex-start' : 'center' }}>
      <Box flexGrow={0} order={0} display={'flex'} alignSelf={'center'}>
        <img src={logoUrl} alt={symbol} style={{ width: '32px', height: '32px', borderRadius: '32px' }} /> 
      </Box>
      <Box flexGrow={0} order={1} display={'flex'} flexDirection={'column'} justifyContent={'center'}>
        <Typography>{symbol}</Typography>
        <Box display={'flex'} flexDirection={'column'}>
          <Typography>{tokenUsdPrice[tokenAddress].toFixed(2)}$</Typography>
          {priceVariation > 0 && <Typography color={'success'} display={'flex'} alignItems={'center'} justifyContent={'center'}>
            <ArrowUpwardRounded color={'success'} fontSize="inherit"/>
            {priceVariation.toFixed(2)}{'%'}
          </Typography>}
          {priceVariation < 0 && <Typography color={'error'} display={'flex'} alignItems={'center'} justifyContent={'center'}>
            <ArrowDownwardRounded color={'error'} fontSize="inherit"/>
            {priceVariation.toFixed(2)}{'%'}
          </Typography>}
        </Box>
      </Box>
      <motion.div layout style={{ order: 2, display: 'flex', flexGrow: 1, alignSelf: 'center', flexBasis: isExpanded ? '50%' : 0 }} />
      {!!chartData && <motion.div layout style={{ order: isExpanded ? 6 : 3, flexGrow: 1, width: isExpanded ? '300px' : '450px', height: isExpanded ? '300px' : '100px' }}>
        <LineChart
          xAxis={[ { data: chartData?.map(el => el.x ), min: chartData[0].x, max: chartData[chartData.length - 1].x, valueFormatter: (value) => `${new Date(value as number).toLocaleString()}` }]}
          series={[ { data: chartData?.map(el => el.y ), showMark: false }]}
          bottomAxis={isExpanded ? 'defaultized-x-axis-0' : null}
          leftAxis={isExpanded ? DEFAULT_Y_AXIS_KEY : null}
          margin={!isExpanded ? { top: 0, right: 0, bottom: 0, left: 0 } : { top: 54, right: 54, bottom: 54, left: 54 }}
          colors={[ theme.palette.secondary.main ]}
        />
      </motion.div>}
      <Box flexGrow={0} order={4} display={'flex'} alignSelf={'center'}>
        <ToggleButtonGroup
          color="primary"
          value={tab}
          exclusive
          onChange={handleChange}
          sx={{
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
          <ToggleButton value="1d" color="secondary" disableRipple>1d</ToggleButton>
          <ToggleButton value="1w" color="secondary" disableRipple>1w</ToggleButton>
          <ToggleButton value="1m" color="secondary" disableRipple>1M</ToggleButton>
          <ToggleButton value="ytd" color="secondary" disableRipple>ytd</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box order={5} flexGrow={0} display={'flex'} alignSelf={'center'}>
        <IconButton ref={btnScope} onClick={handleExpandClick} sx={{ borderRadius: '32px' }}>
          <KeyboardArrowDownRoundedIcon />
        </IconButton>
      </Box>
    </motion.div>
  </Card>;
};

const TokenList = () => {
  const [ error, setError ] = useState<Error | null>(null);
  const { tokenUsdPrice, fetchTokenPrices } = useContext(AlchemyCacheContext);

  useEffect(() => {
    // Fetch
    (async () => {
      try {
        await fetchTokenPrices(Object.values(ARBITRUM_CONTRACT_ADDRESSES));
      } catch (error) {
        setError(error as unknown as Error);
      }
    })();
  }, [ fetchTokenPrices ]);

  if (error) {
    return <Stack>
      <Typography variant='h5' color='error'>{error.message}</Typography>
    </Stack>
  }

  return <Stack spacing={4}>{
    Object.keys(tokenUsdPrice).map(el => <Token key={el} tokenAddress={el} />)
  }</Stack>
};

export default TokenList;