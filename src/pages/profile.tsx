import { useTranslation } from 'react-i18next';
import { Nav } from 'react-bootstrap';
import { useContext, useState } from 'react';
import { Spin } from 'antd';
import { ModalContext } from '../components/Context';
import { useAppSelector } from '../utilities/hooks';
import Helmet from '../components/Helmet';
import ProfileForm from '../components/forms/ProfileForm';
import AddressForm from '../components/forms/AddressForm';

const MyProfile = () => {
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.login);
  const { modalShow } = useContext(ModalContext);

  const [loading, setLoading] = useState(false);

  return (
    <>
      <Helmet title={t('profile.title')} description={t('profile.submit')} />
      <h4 className="text-center mb-4">{t('profileButton.profile')}</h4>
      {user.username ? (
        <>
          <Spin spinning={loading} tip={t('profile.saving')} size="large" fullscreen />
          <div className="d-flex flex-column flex-md-row justify-content-between">
            <ProfileForm user={user} setLoading={setLoading} />
            <AddressForm user={user} setLoading={setLoading} />
          </div>
        </>
      ) : (
        <div className="d-flex flex-column flex-md-row justify-content-center align-items-center">
          {t('profile.entrace1')}
          <Nav role="button" className="nav-link px-2" onClick={() => modalShow('login')}>
            {t('profile.entrace')}
          </Nav>
          {t('profile.entrace2')}
          <Nav role="button" className="nav-link ps-2" onClick={() => modalShow('signup')}>
            {t('profile.signup')}
          </Nav>
        </div>
      )}
    </>
  );
};

export default MyProfile;
