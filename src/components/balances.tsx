import { AlchemyCacheContext } from "@context/achemy-cache";
import { EVMWalletContext } from "@context/evm";
import { TokenBalance } from "@interfaces/alchemy";
import { QuestionMarkRounded } from "@mui/icons-material";
import { Avatar, Box, CircularProgress, Grid2, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { formatUnits } from "viem";

const TokenDisplay = ({ token }: { token: TokenBalance }) => {
  const { tokenInfo, fetchTokenInfo } = useContext(AlchemyCacheContext);

  const [ parsedBalance, setParsedBalance ] = useState<string>('0');
  const [ logo, setLogo ] = useState<string>('');

  useEffect(() => {
    (async () => await fetchTokenInfo(token.contractAddress))();
  }, [ token , fetchTokenInfo ]);

  useEffect(() => {
    if (tokenInfo && tokenInfo[token.contractAddress]) {
      setParsedBalance(
        Number(formatUnits(BigInt(token.tokenBalance), tokenInfo[token.contractAddress].decimals)).toFixed(2)
      );
    }
  }, [ tokenInfo, token ]);

  useEffect(() => {
    if (tokenInfo && tokenInfo[token.contractAddress] && tokenInfo[token.contractAddress].logo) {
      setLogo(tokenInfo[token.contractAddress].logo);
    }
  }, [ tokenInfo, token ]);

  if (!tokenInfo || !tokenInfo[token.contractAddress]) {
    return <Box display={'flex'} justifyContent={'space-between'}>
      <CircularProgress />
      </Box>;
  }

  return <>
    <Grid2 size={{ xs: 2 }}>
      { !logo && <Avatar sx={{ width: '24px', height: '24px' }}><QuestionMarkRounded fontSize='small' /></Avatar>}
      { logo && <Avatar src={logo} sx={{ width: '24px', height: '24px' }} />}
    </Grid2>
    <Grid2 size={{ xs: 8 }}>
      <Typography fontWeight={600}>{tokenInfo[token.contractAddress].symbol}</Typography>
    </Grid2>
    <Grid2 size={{ xs: 2 }}>
      <Typography fontWeight={400}>{parsedBalance}</Typography>
    </Grid2>
  </>;
};

const Balances = () => {
  const { currentAddress, ethBalance } = useContext(EVMWalletContext);
  const { balances } = useContext(AlchemyCacheContext);

  return <Grid2 sx={{
    padding: '24px',
  }} container rowSpacing={2}>
    <Grid2 size={{ xs: 2 }}>
      <Typography variant='caption' fontWeight={600} color='textSecondary'>Icon</Typography>
    </Grid2>
    <Grid2 size={{ xs: 8 }}>
      <Typography variant='caption' fontWeight={600} color='textSecondary'>Symbol</Typography>
    </Grid2>
    <Grid2 size={{ xs: 2 }}>
      <Typography variant='caption' fontWeight={600} color='textSecondary'>Balance</Typography>
    </Grid2>
    <Grid2 size={{ xs: 2 }}>
      <Avatar sx={{ width: '24px', height: '24px' }}><QuestionMarkRounded fontSize='small' /></Avatar>
    </Grid2>
    <Grid2 size={{ xs: 8 }}>
      <Typography fontWeight={600}>ETH</Typography>
    </Grid2>
    <Grid2 size={{ xs: 2 }}>
      <Typography fontWeight={400}>{ethBalance.toFixed(5)}</Typography>
    </Grid2>
    {balances && balances[currentAddress]?.length === 0 && <Grid2 size={{ xs: 12 }}>
      <Typography>No tokens found</Typography>
    </Grid2>}
    {balances && balances[currentAddress]?.map((t) => (<TokenDisplay token={t}/>))}
  </Grid2>;
};

export default Balances;