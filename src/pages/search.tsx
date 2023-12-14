import { useTranslation } from 'react-i18next';
import { Result } from 'antd';
import Helmet from '../components/Helmet';

const Search = () => {
  const { t } = useTranslation();
  return (
    <div className="my-4 row d-flex justify-content-center">
      <div className="col-12 col-md-8">
        <Helmet title={t('search.header')} description={t('search.title')} />
        <Result
          status="404"
          title={t('search.header')}
          subTitle={t('search.title')}
        />
      </div>
    </div>
  );
};

export default Search;
