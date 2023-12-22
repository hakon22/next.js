/* eslint-disable no-nested-ternary */
import axios from 'axios';
import { Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import routes from '@/routes';
import ActivationForm from '../../components/forms/ActivationForm';
import Helmet from '../../components/Helmet';

export const getServerSideProps = async ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const { data } = await axios.get(`${routes.activation}${id}`);

  return data
    ? { props: { id, email: data } }
    : {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };
};

const Activation = ({ id, email }: { id: string, email: string }) => {
  const { t } = useTranslation();

  return (
    <div className="my-4 row d-flex justify-content-center">
      <div className="col-12 col-md-8">
        <Helmet title={t('activationForm.title')} description={t('activationForm.submit')} />
        <Card border="secondary" className="text-center card-bg">
          <Card.Header className="h4">{t('activationForm.title')}</Card.Header>
          <Card.Body>
            <ActivationForm id={id} email={email} />
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default Activation;
