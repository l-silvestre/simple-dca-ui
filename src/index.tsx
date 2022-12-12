import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';

import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { Root } from './routes/root';
import { ErrorPage } from './routes/error';
import { Dashboard } from './routes/dashboard';
import { Invest } from './routes/invest';
import { Stats } from './routes/stats';
import { History } from './routes/history';
import { ethers } from 'ethers';
import { Web3Provider } from './web3Context';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/invest',
        element: <Invest />,
      },
      {
        path: '/stats',
        element: <Stats />,
      },
      {
        path: '/history',
        element: <History />
      }
    ]
  },
]);

const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
  cache: new InMemoryCache(),
});

const ethereum = new ethers.providers.Web3Provider(window.ethereum);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <Web3Provider value={ethereum}>
        <RouterProvider router={router}/>
      </Web3Provider>
    </ApolloProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
