'use client';
import { ApolloProvider } from '@apollo/client';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from '@decent-org/fractal-ui';
import { ReactNode, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { ModalProvider } from '../components/ui/modals/ModalProvider';
import Layout from '../components/ui/page/Layout';
import { ErrorFallback } from '../components/ui/utils/ErrorFallback';
import graphQLClient from '../graphql';
import { FractalErrorBoundary, initErrorLogging } from '../helpers/errorLogging';
import { AppProvider } from './App/AppProvider';
import { NetworkConfigProvider } from './NetworkConfig/NetworkConfigProvider';
import Web3ModalProvider from './Web3ModalProvider';

export default function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    initErrorLogging();
  }, []);
  return (
    <ChakraProvider
      theme={theme}
      resetCSS
    >
      <FractalErrorBoundary fallback={<ErrorFallback />}>
        <ApolloProvider client={graphQLClient}>
          <Web3ModalProvider>
            <NetworkConfigProvider>
              <AppProvider>
                <ToastContainer
                  position="bottom-center"
                  closeButton={false}
                  newestOnTop={false}
                  pauseOnFocusLoss={false}
                />
                <ModalProvider>
                  <Layout>{children}</Layout>
                </ModalProvider>
              </AppProvider>
            </NetworkConfigProvider>
          </Web3ModalProvider>
        </ApolloProvider>
      </FractalErrorBoundary>
    </ChakraProvider>
  );
}
