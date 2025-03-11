import Head from 'next/head';

const HeadMeta = () => (
  <Head>
    <meta name="theme-color" content="#000000" /> {/* Android 상태 표시줄 색상 */}
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" /> {/* iOS 상태 표시줄 스타일 */}
  </Head>
);

export default HeadMeta;
