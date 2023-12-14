import Head from 'next/head';

type HelmetProps = {
  title: string;
  description: string;
}

const Helmet = ({ title, description }: HelmetProps) => (
  <Head>
    <title>{title}</title>
    <meta name="description" content={description} />
    {typeof window !== 'undefined' && <link rel="canonical" href={window.location.href} />}
  </Head>
);

export default Helmet;
