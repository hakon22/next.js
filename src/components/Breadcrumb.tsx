import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Breadcrumb as BreadcrumbAntd } from 'antd';
import routes from '../routes';
import Helmet from './Helmet';

type BreadcrumbState = {
  title: JSX.Element | string,
  helmet: string,
}

const Breadcrumb = () => {
  const { t } = useTranslation();
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbState[]>([]);

  const helmet = breadcrumbs[breadcrumbs.length - 1]?.helmet;

  useEffect(() => {
    const pathArray = pathname.slice(1).split('/');
    const linkArray: string[] = [];

    setBreadcrumbs(pathArray.map((folder, index) => {
      if (pathArray.length === 1) {
        return {
          title: '',
          helmet: t('navBar.title'),
        };
      }
      if (index === 0) {
        return {
          title: <Link href={routes.homePage}>{t('navBar.title')}</Link>,
          helmet: t('navBar.title'),
        };
      }
      linkArray.push(folder);
      if (pathArray.length - 1 === index) {
        const page = t(`navBar.menu.${folder}`);
        return {
          title: page,
          helmet: page,
        };
      }
      const link = linkArray.reduce((acc, fold) => `${acc}/${fold}`, '');
      const page = t(`navBar.menu.${folder}`);
      return {
        title: <Link href={link}>{page}</Link>,
        helmet: page,
      };
    }));
  }, [pathname]);

  return (
    <>
      <Helmet
        title={helmet ?? t('marketplace.title')}
        description={helmet ?? t('marketplace.description')}
      />
      <BreadcrumbAntd items={breadcrumbs} />
    </>
  );
};

export default Breadcrumb;
