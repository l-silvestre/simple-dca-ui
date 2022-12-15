import { useQuery } from '@apollo/react-hooks';
import { Divider, Avatar, Skeleton, Card, CircularProgress } from '@mui/material';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Pagination from '@mui/material/Pagination';
import { TOKEN_INFO_LIST_QUERY } from '../queries';
import { useOutletContext } from 'react-router-dom';
import { getAddress } from 'ethers/lib/utils';
import { ChangeEvent, useState } from 'react';
import { getLogoUrl } from '../helpers';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export const Dashboard = () => {
  let skip = 0;
  const containerHeight = useOutletContext() as number;

  const [page, setPage] = useState(1);

  const handlePageChange = (event: ChangeEvent<unknown>, value: number) => {
    setPage(value);
    skip = (value * 10) -10;
    fetchMore({
      variables: {
        skip,
        limit: 10
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return fetchMoreResult;
      },
    })
  };

  const { loading: queryLoading, data: queryData, error, fetchMore } = useQuery(TOKEN_INFO_LIST_QUERY, {
    variables: { skip, limit: 10 }
  });

  if (queryLoading) return (
    <Box sx={{ width: '100%', display: 'flex' }}>
      <CircularProgress />
      <Stack spacing={2}>
        {Array(10).map((_) =>  <Skeleton />)}
      </Stack>
    </Box>
  );

  if (error) return (
    <p>{error.message}</p>
  )

  return (
    <Paper>
      <Box sx={{ width: '100%' }}>
        <Stack spacing={2}>
          {!queryLoading && queryData.tokens.map((token: any) => {
            return (
              <Item key={token?.id}>
                <Avatar src={getLogoUrl(getAddress(token.id))}></Avatar>
                {token?.symbol}
              </Item>
            )
          })}
        </Stack>
        <Divider></Divider>
        <Pagination
          count={10}
          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          page={page}
          onChange={handlePageChange}
        />
      </Box>
    </Paper>
  );
}