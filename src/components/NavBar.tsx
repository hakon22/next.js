import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import Link from 'next/link';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import cn from 'classnames';
import { Navbar, Container, Nav } from 'react-bootstrap';
import ProfileButton from './ProfileButton';
import { useAppSelector } from '../utilities/hooks';
import { selectors } from '../slices/marketSlice';
import { MobileContext } from './Context';
import routes, { catalogPages } from '../routes';
import type { Item } from '../types/Item';
import Search from './Search';

const NavBar = () => {
  const { t } = useTranslation();
  const isMobile = useContext(MobileContext);

  const itemsMarket: Item[] = useAppSelector(selectors.selectAll);

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (<Link className="nav-link" href={catalogPages.vegetables}>{t('navBar.menu.vegetables')}</Link>),
    },
    {
      key: '2',
      label: (<Link className="nav-link" href={catalogPages.fruits}>{t('navBar.menu.fruits')}</Link>),
    },
    {
      key: '3',
      label: (<Link className="nav-link" href={catalogPages.frozen}>{t('navBar.menu.frozen')}</Link>),
    },
    {
      key: '4',
      label: (<Link className="nav-link" href={catalogPages.freshMeat}>{t('navBar.menu.freshMeat')}</Link>),
    },
    {
      key: '5',
      label: (<Link className="nav-link" href={catalogPages.dairy}>{t('navBar.menu.dairy')}</Link>),
    },
    {
      key: '6',
      label: (<Link className="nav-link" href={catalogPages.fish}>{t('navBar.menu.fish')}</Link>),
    },
    {
      key: '7',
      label: isMobile ? t('navBar.menu.sweet') : (<Link className="nav-link" href={catalogPages.sweet}>{t('navBar.menu.sweet')}</Link>),
      children: [
        {
          key: '7-1',
          label: (<Link className="nav-link" href={catalogPages.iceCream}>{t('navBar.menu.iceCream')}</Link>),
        },
        {
          key: '7-2',
          label: (<Link className="nav-link" href={catalogPages.chocolate}>{t('navBar.menu.chocolate')}</Link>),
        },
      ],
    },
  ];

  return (
    <Navbar expand={isMobile ? 'xxl' : true}>
      <Container>
        <Navbar.Text className="me-md-5 col-md-2">
          <Link className="navbar-brand" href={routes.homePage}>{t('navBar.title')}</Link>
        </Navbar.Text>
        {isMobile && <ProfileButton className="ms-5 profile" />}
        <Navbar.Toggle>
          <span />
          <span />
          <span />
        </Navbar.Toggle>
        <Navbar.Collapse className="justify-content-start col-md-5">
          <Nav className={isMobile ? 'mb-1' : 'gap-3'}>
            <Link className="nav-link" href={catalogPages.discounts}>{t('navBar.menu.discounts')}</Link>
            <Link className="nav-link" href={catalogPages.delivery}>{t('navBar.menu.delivery')}</Link>
            <Dropdown menu={{ items }} trigger={['click', 'hover']} className={cn('dropdown-toggle nav-link', { 'w-50': isMobile })}>
              <span role="button">{t('navBar.menu.catalog')}</span>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
        <Navbar.Collapse className="justify-content-start col-md-3">
          <Search items={itemsMarket} />
        </Navbar.Collapse>
        {!isMobile && <ProfileButton className="d-flex justify-content-end profile" />}
      </Container>
    </Navbar>
  );
};

export default NavBar;
