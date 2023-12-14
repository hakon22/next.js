import { useTranslation } from 'react-i18next';
import { SmileOutlined } from '@ant-design/icons';
import { Result } from 'antd';
import Helmet from '../components/Helmet';

const Delivery = () => {
  const { t } = useTranslation();
  return (
    <div className="my-4 row d-flex justify-content-center">
      <div className="col-12 col-md-8">
        <Helmet title={t('delivery.header')} description={t('delivery.title')} />
        <Result
          icon={<SmileOutlined />}
          title={t('delivery.title')}
          subTitle={t('delivery.subTitle')}
        />
      </div>
    </div>
  );
};

export default Delivery;
