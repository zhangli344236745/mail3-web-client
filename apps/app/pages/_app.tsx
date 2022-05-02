import Head from 'next/head'
import { appWithTranslation } from 'next-i18next'
import Script from 'next/script'
import type { AppProps } from 'next/app'
import { Provider as JotaiProvider } from 'jotai'
import { theme } from 'ui'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ChakraProvider } from '@chakra-ui/react'
import { useMemo } from 'react'
import '../styles/globals.css'

function Mail3({ Component, pageProps }: AppProps) {
  const queryClient = useMemo(() => new QueryClient(), [])

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
        />
        <meta name="description" content="Description" />
        <meta name="keywords" content="Keywords" />
        <title>Mail3</title>

        <link rel="manifest" href="/manifest.json" />
        <link
          href="/icons/icon-16x16.png"
          rel="icon"
          type="image/png"
          sizes="16x16"
        />
        <link
          href="/icons/icon-32x32.png"
          rel="icon"
          type="image/png"
          sizes="32x32"
        />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <meta name="theme-color" content="#317EFB" />
      </Head>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-WH0BKBPFWP"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-WH0BKBPFWP', { debug_mode: true });
        `}
      </Script>
      <QueryClientProvider client={queryClient}>
        <JotaiProvider>
          <ChakraProvider theme={theme}>
            <Component {...pageProps} />
          </ChakraProvider>
        </JotaiProvider>
      </QueryClientProvider>
    </>
  )
}

export default appWithTranslation(Mail3)