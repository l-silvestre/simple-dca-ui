import { AlchemyCacheContext } from "@context/achemy-cache";
import { EVMWalletContext } from "@context/evm";
import useTokenInfo from "@hooks/useTokenInfo";
import { TransferData } from "@interfaces/alchemy";
import { QuestionMarkRounded } from "@mui/icons-material";
import { Card, Box, Stack, Typography, Avatar, CircularProgress } from "@mui/material";
import { RefObject, useContext, useEffect, useState } from "react";

const Activity = ({ tx }: { tx: TransferData }) => {

  const [ logo, setLogo ] = useState<string>('');
  const [ symbol, setSymbol ] = useState<string>('');
  const tokenInfo = useTokenInfo(tx.rawContract?.address);

  useEffect(() => {
    if (tx.category === 'external') {
      setSymbol('ETH');
    } else {
      setSymbol(tx.asset);
    }
    
    if (tokenInfo && tx.rawContract?.address && tokenInfo && tokenInfo.logo) {
      setLogo(tokenInfo.logo);
    }
  }, [ tx, tokenInfo ]);

  return <Card elevation={24} sx={{ padding: 2, borderRadius: '32px', gap: 2, display: 'flex', alignItems: 'center' }}>
    { !logo && <Avatar><QuestionMarkRounded /></Avatar>}
    { logo && <Avatar src={logo} />}
    <Box display={'flex'} flexDirection={'column'} flexGrow={1}>
      <Typography noWrap>{tx.from.slice(0, 8)}...</Typography>
      <Typography noWrap>{tx.to.slice(0,8)}...</Typography>
    </Box>
    <Typography>{Number(tx.value).toFixed(2)}{symbol}</Typography>
  </Card>;
};

const ActivityList = ({ scrollRef }: { scrollRef: RefObject<HTMLDivElement | null>}) => {
  const { currentAddress } = useContext(EVMWalletContext);
  const { transactions, fetchTransactions } = useContext(AlchemyCacheContext);
  const [ uniqueTokens, setUniqueTokens ] = useState<TransferData[]>([]);


  useEffect(() => {
    (async () => await fetchTransactions(currentAddress))();
  }, [ currentAddress, fetchTransactions ]);

  useEffect(() => {
    if (transactions[currentAddress]) {
      const tokens = transactions[currentAddress].filter((tx, index, self) => self.findIndex((t) => t.hash === tx.hash) === index);
      setUniqueTokens(tokens);
    }
  }, [ transactions, currentAddress ]);

  if (!transactions[currentAddress]) {
    return <Box sx={{ padding: '24px' }}>
      <CircularProgress />
    </Box>;
  }

  return <Box ref={scrollRef} sx={{
    padding: '24px',
    paddingBottom: '54px',
    maxHeight: '500px',
    overflowY: 'scroll',
  }}>
    <Stack spacing={4}>
      {uniqueTokens.map((tx) => (<Activity key={tx.hash} tx={tx} />))}
    </Stack>
  </Box>;
};

export default ActivityList;