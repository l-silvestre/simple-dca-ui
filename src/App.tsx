import './App.css';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { getAddress, isAddress } from 'ethers/lib/utils';



const DAI_QUERY = gql`
  query tokens($tokenAddress: Bytes!) {
    tokens(where: { id: $tokenAddress }) {
      derivedETH
      totalLiquidity
    }
  }
`;

const ETH_PRICE_QUERY = gql`
  query bundles {
    bundles(where: { id: "1" }) {
      ethPrice
    }
  }
`;

const TOKEN_LIST_QUERY = gql`
  query tokens {
    tokens(first: 10, orderBy: volumeUSD, orderDirection: desc) {
      symbol,
      name,
      id
    }
  }
`

const POOL_LIST_QUERY = gql`
  query pairs($tokenId: String!) {
    pools(where: { token0: $tokenId }) {
      id,
      token0 {
        id,
        name,
        symbol
      },
      token1 {
        id,
        name,
        symbol
      }
    }
  }
`;

interface ITokenDisplay {
  id: string,
  name: string,
  symbol: string,
};

interface IPairDisplay {
  id: string;
  token0: ITokenDisplay,
  token1: ITokenDisplay,
};


const TokensListDisplay = (props: { tokens: ITokenDisplay[] }) => {
  const listItems = props?.tokens?.map((token) =>{
    const addr = getAddress(token.id);
    const url = `https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/${addr}/logo.png`
    const li = <li key={token.id}>
      <div>
        <h2>{token.symbol}</h2>
        <p>{token.name}</p>
        <img src={url} className="App-logo" alt="logo" />
      </div>
    </li>

    return li
  }
    
  );
  return (
    listItems && <ul>{listItems}</ul>
  );
}

const PairList = (props: { usdcId: string }) => {
  const { loading: pairLoading, data, error } = useQuery(POOL_LIST_QUERY, {
    variables: {
      tokenId: props.usdcId,
    }
  });
  const pairsList: IPairDisplay[] = data && data.pools;

  return pairLoading ? <p>Loading...</p> : pairsList && <ul>{pairsList.map(pair => {
    const token0 = pair.token0;
    const addr = getAddress(token0.id);
    const url = `https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/${addr}/logo.png`
    const token1 = pair.token1;
    const addr1 = getAddress(token1.id);
    const url1 = `https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/${addr1}/logo.png`
    return <li>
      <p>{token0.symbol}<img src={url}/></p>
      <p>{token1.symbol}<img src={url1}/></p>
    </li>
  })}</ul>
  //return pairLoading ? <p>Loading...</p> : error ? <p>{error.message}</p> : <p>{JSON.stringify(data)}</p>;
}

const App = () => {
  const { loading: ethLoading, data: ethPriceData } = useQuery(ETH_PRICE_QUERY);
  const { loading: listLoading, data: result } = useQuery(TOKEN_LIST_QUERY);
  const { loading: daiLoading, data: daiData } = useQuery(DAI_QUERY, {
    variables: {
      tokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
    },
  });

  const daiPriceInEth = daiData && daiData.tokens[0].derivedETH;
  const daiTotalLiquidity = daiData && daiData.tokens[0].totalLiquidity;
  const ethPriceInUSD = ethPriceData && ethPriceData.bundles[0].ethPrice;
  const tokenList: ITokenDisplay[] = result && result.tokens;

  return (
    <div>
      <div>
        Dai price:{' '}
        {ethLoading || daiLoading
          ? 'Loading token data...'
          : '$' +
            // parse responses as floats and fix to 2 decimals
            (parseFloat(daiPriceInEth) * parseFloat(ethPriceInUSD)).toFixed(2)}
      </div>
      <div>
        Dai total liquidity:{' '}
        {daiLoading
          ? 'Loading token data...'
          : // display the total amount of DAI spread across all pools
            parseFloat(daiTotalLiquidity).toFixed(0)}
      </div>
      <div>
        Tokens List:{' '}
        {listLoading ? 'Loading Tokens...' : (tokenList && tokenList.length > 0 && <TokensListDisplay tokens={tokenList}/>)}
      </div>
      <PairList usdcId={(tokenList || []).find(el => el.symbol === 'USDC')?.id!}/>
    </div>
  );
}

export default App;
