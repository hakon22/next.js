/* eslint-disable react/jsx-props-no-spreading */
import type { AppProps, AppContext } from 'next/app';
import App from 'next/app';
import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
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

init.getInitialProps = async (context: AppContext) => {
  const { req } = context.ctx;
  const userAgent = req ? req.headers['user-agent'] : navigator.userAgent;
  const isMob = isMobile(userAgent);
  const props = await App.getInitialProps(context);

  return { ...props, isMob };
};

export default init;
