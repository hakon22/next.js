/* eslint-disable react/jsx-props-no-spreading */
import type { AppProps, AppContext } from 'next/app';
import App from 'next/app';
import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
// import { isMobile as isMob } from 'react-device-detect';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { fetchItems } from '../slices/marketSlice';
import wrapper from '../slices/index';
import General from '../components/App';
import '../scss/app.scss';
import resources from '../locales/index';
import isMobile from '../utilities/isMobile';

const init = ({ Component, ...rest }: AppProps) => {
  const i18n = i18next.createInstance();

  i18n
    .use(initReactI18next)
    .init({
      returnNull: false,
      lng: 'ru',
      resources,
      fallbackLng: 'ru',
      interpolation: {
        escapeValue: false,
      },
    });

  const { store, props } = wrapper.useWrappedStore(rest);
  const { pageProps } = props;

  return (
    <I18nextProvider i18n={i18n}>
      <Provider store={store}>
        <ToastContainer />
        <General isMob={props.isMob}>
          <Component {...pageProps} />
        </General>
      </Provider>
    </I18nextProvider>
  );
};

init.getInitialProps = wrapper.getInitialAppProps((store) => async (context) => {
  await store.dispatch(fetchItems());
  const { ctx, Component } = context;
  const userAgent = ctx.req ? ctx.req.headers['user-agent'] : navigator.userAgent;
  const isMob = isMobile(userAgent);
  const props = await App.getInitialProps(context);

  // return { ...props, isMob };
  return {
    pageProps: {
      ...(Component.getInitialProps
        ? await Component.getInitialProps({ ...ctx, store })
        : {}),
    },
    isMob,
  };
});

export default init;
