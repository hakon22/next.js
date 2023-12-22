const Catalog = () => null;

export const getServerSideProps = () => ({
  redirect: {
    permanent: false,
    destination: '/',
  },
});

export default Catalog;
