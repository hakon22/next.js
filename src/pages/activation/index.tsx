const Activation = () => null;

export const getServerSideProps = () => ({
  redirect: {
    permanent: false,
    destination: '/',
  },
});

export default Activation;
