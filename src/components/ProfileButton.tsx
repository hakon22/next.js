import { useTranslation } from 'react-i18next';
import {
  BoxArrowInRight, BoxArrowInLeft, CartCheck, PersonAdd, PersonCircle, FilePlus,
} from 'react-bootstrap-icons';
import { useContext } from 'react';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { NavDropdown } from 'react-bootstrap';
import { useAppSelector } from '../utilities/hooks';
import AuthContext, { ModalContext } from './Context';
import routes from '../routes';

const ProfileButton = ({ className }: { className?: string }) => {
  const { t } = useTranslation();
  const { logOut, loggedIn } = useContext(AuthContext);
  const { modalShow } = useContext(ModalContext);

  const { username, role } = useAppSelector((state) => state.login);

  return (
    <NavDropdown
      title={<Avatar size="large" className="fs-4">{username?.[0] || <UserOutlined />}</Avatar>}
      className={className}
    >
      {loggedIn ? (
        <>
          <NavDropdown.ItemText className="text-muted">{username}</NavDropdown.ItemText>
          <NavDropdown.Divider />
          {role === 'admin' && (
            <NavDropdown.Item onClick={() => modalShow('createItem')}>
              <FilePlus />
              {t('createItem.addItem')}
            </NavDropdown.Item>
          )}
          <NavDropdown.Item as={Link} href={routes.profilePage}>
            <PersonCircle />
            {t('profileButton.profile')}
          </NavDropdown.Item>
          <NavDropdown.Item as={Link} href={routes.ordersPage}>
            <CartCheck />
            {t('profileButton.myOrders')}
          </NavDropdown.Item>
          <NavDropdown.Item onClick={logOut}>
            <BoxArrowInLeft />
            {t('profileButton.exit')}
          </NavDropdown.Item>
        </>
      ) : (
        <>
          <NavDropdown.Item onClick={() => modalShow('login')}>
            <BoxArrowInRight />
            {t('profileButton.login')}
          </NavDropdown.Item>
          <NavDropdown.Item onClick={() => modalShow('signup')}>
            <PersonAdd />
            {t('profileButton.signup')}
          </NavDropdown.Item>
        </>
      )}
    </NavDropdown>
  );
};

ProfileButton.defaultProps = {
  className: null,
};

export default ProfileButton;
