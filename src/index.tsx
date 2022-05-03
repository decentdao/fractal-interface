import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import './index.css';
import reportWebVitals from './reportWebVitals';
import { Web3Provider } from './web3';
import { DAODataProvider } from './daoData';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <Web3Provider>
        <DAODataProvider>
          <ToastContainer
            position="bottom-center"
            closeButton={false}
            newestOnTop={false}
            pauseOnFocusLoss={false}
            toastClassName="font-sans font-medium shadow bg-gray-400 text-gray-25 text-center cursor-pointer"
            progressClassName="bg-none bg-gold-500"
          />
          <App />
        </DAODataProvider>
      </Web3Provider>
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
