/* eslint-disable no-nested-ternary */
import { Card, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ActivationForm from '../components/forms/ActivationForm';
import { fetchActivation } from '../slices/loginSlice';
import { useAppDispatch, useAppSelector } from '../utilities/hooks';
import Helmet from '../components/Helmet';
import Page404 from './404';

const Activation = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const [continueActivation, setContinueActivation] = useState(false);
  const { loadingStatus } = useAppSelector((state) => state.login);

  useEffect(() => {
    if (id) {
      const needsActivation = async () => {
        const { payload } = await dispatch(fetchActivation(id));
        if (payload) {
          setContinueActivation(true);
        }
      };
      needsActivation();
    }
  }, [id]);

  return loadingStatus !== 'finish'
    ? (
      <div className="h-100 d-flex justify-content-center align-items-center">
        <Spinner animation="border" variant="primary" role="status" />
      </div>
    )
    : continueActivation ? (
      <div className="my-4 row d-flex justify-content-center">
        <div className="col-12 col-md-8">
          <Helmet title={t('activationForm.title')} description={t('activationForm.submit')} />
          <Card border="secondary" className="text-center card-bg">
            <Card.Header className="h4">{t('activationForm.title')}</Card.Header>
            <Card.Body>
              <ActivationForm id={id} />
            </Card.Body>
          </Card>
        </div>
      </div>
    ) : <Page404 />;
};

export default Activation;
