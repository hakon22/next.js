/* eslint-disable react/jsx-props-no-spreading */
import type { AppProps, AppContext } from 'next/app';
import Head from 'next/head';
import App from 'next/app';
import i18next from 'i18next';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import favicon from '../images/favicon.ico';
import store from '../slices/index';
import General from '../components/App';
import '../scss/app.scss';
import resources from '../locales/index';
import isMobile from '../utilities/isMobile';

interface InitProps extends AppProps {
  isMob: boolean;
}

const init = (props: InitProps) => {
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

  const { pageProps, Component } = props;

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_ID ?? ''}>
      <I18nextProvider i18n={i18n}>
        <Provider store={store}>
          <Head>
            <link rel="shortcut icon" href={favicon.src} />
          </Head>
          <ToastContainer />
          <General isMob={props.isMob}>
            <Component {...pageProps} />
          </General>
        </Provider>
      </I18nextProvider>
    </GoogleOAuthProvider>
  );
};

init.getInitialProps = async (context: AppContext) => {
  const { req } = context.ctx;
  const userAgent = req ? req.headers['user-agent'] : navigator.userAgent;
  const isMob = isMobile(userAgent);
  const props = await App.getInitialProps(context);

  return { ...props, isMob };
};

export default init;
