import gql from 'graphql-tag';

export const POOLS_QUERY = gql`
  query pairs($tokenId: String!) {
    usdcFirst: pools(first: 50, where: { token0: $tokenId }, orderBy: volumeUSD, orderDirection: desc) {
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
    },
    usdcSecond: pools(first: 50, where: { token1: $tokenId }, orderBy: volumeUSD, orderDirection: desc) {
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
`