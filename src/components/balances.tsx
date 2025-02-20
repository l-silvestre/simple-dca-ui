import { AlchemyCacheContext } from "@context/achemy-cache";
import { EVMWalletContext } from "@context/evm";
import { TokenBalance } from "@interfaces/alchemy";
import { Box, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { formatUnits } from "viem";

const TokenDisplay = ({ token }: { token: TokenBalance }) => {
  const { tokenInfo, fetchTokenInfo } = useContext(AlchemyCacheContext);

  const [ parsedBalance, setParsedBalance ] = useState<string>('0');

  useEffect(() => {
    (async () => await fetchTokenInfo(token.contractAddress))();
  }, [ token , fetchTokenInfo ]);

  useEffect(() => {
    if (tokenInfo && tokenInfo[token.contractAddress]) {
      setParsedBalance(formatUnits(BigInt(token.tokenBalance), tokenInfo[token.contractAddress].decimals));
    }
  }, [ tokenInfo, token ]);

  return <Box display={'flex'} justifyContent={'space-between'}>
    <Box display={'flex'} alignItems={'center'} gap={'8px'}>
      <img width='20px' height='20px' src={tokenInfo[token.contractAddress].logo} />
      <Typography fontWeight={600}>{tokenInfo[token.contractAddress].symbol}</Typography>
    </Box>
    <Typography fontWeight={400}>{parsedBalance}</Typography>
  </Box>;
};

const Balances = () => {
  const { currentAddress, ethBalance } = useContext(EVMWalletContext);
  const { balances, fetchBalances } = useContext(AlchemyCacheContext);

  useEffect(() => {
    if (currentAddress !== '') {
      (async () => {
        try {
          await fetchBalances(currentAddress);
        } catch (error) {
          console.error(error);
        }
      })();
    }
  }, [ currentAddress, fetchBalances ]);

  useEffect(() => {
    console.log(balances, 'balances');
    console.log(ethBalance, 'ethBalance');
  }, [ balances, ethBalance ]);

  return balances && balances[currentAddress] && balances[currentAddress].map((t) => (<TokenDisplay token={t}/>));
};

export default Balances;