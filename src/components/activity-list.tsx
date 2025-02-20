import { AlchemyCacheContext } from "@context/achemy-cache";
import { EVMWalletContext } from "@context/evm";
import { TransferData } from "@interfaces/alchemy";
import { Card, Box, Stack, Typography, Avatar } from "@mui/material";
import { RefObject, useContext, useEffect, useState } from "react";

const Activity = ({ tx }: { tx: TransferData }) => {

  const [ logo, setLogo ] = useState<string>('');
  const { tokenInfo, fetchTokenInfo } = useContext(AlchemyCacheContext);

  useEffect(() => {
    (async () => await fetchTokenInfo(tx.rawContract?.address || ''))();
  }, [ tx, fetchTokenInfo ]);

  useEffect(() => {
    if (tokenInfo && tx.rawContract?.address) {
      setLogo(tokenInfo[tx.rawContract.address].logo || '');
    }
  }, [ tx, tokenInfo ]);

  return <Card elevation={24} sx={{ padding: 2, borderRadius: '32px', gap: 2 }}>
    <Avatar src={logo} />
    <Typography noWrap>{tx.from}</Typography>
    <Typography noWrap>{tx.to}</Typography>
    <Typography>{tx.value}</Typography>
  </Card>;
};

const ActivityList = ({ scrollRef }: { scrollRef: RefObject<HTMLDivElement | null>}) => {
  const { currentAddress } = useContext(EVMWalletContext);
  const { transactions, fetchTransactions } = useContext(AlchemyCacheContext);


  useEffect(() => {
    (async () => await fetchTransactions(currentAddress))();
  }, [ currentAddress, fetchTransactions ]);

  return <Box ref={scrollRef} sx={{
    padding: '24px',
    paddingBottom: '54px',
    maxHeight: '500px',
    overflowY: 'scroll',
  }}>
    <Stack spacing={4}>
      {transactions[currentAddress].map((tx) => (<Activity key={tx.hash} tx={tx} />))}
    </Stack>
  </Box>;
};

export default ActivityList;