import '../styles/globals.scss'
import { AppProps } from 'next/app'
import Head from "next/head";
export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
    <Head>
      <meta http-equiv="Content-Security-Policy" content="default-src https://vitals.vercel-insights.com; child-src 'none'; object-src 'none'" />
    </Head>
    <Component {...pageProps} />
    </>
  );
}