import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import store from '../slices/index';
import App from './App';

const Settings = () => (
  <Provider store={store}>
    <ToastContainer />
    <App />
  </Provider>
);

export default Settings;
