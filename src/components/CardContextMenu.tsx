import { Dropdown } from 'antd';
import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import type { MenuProps } from 'antd';

export type Context = { action: string, id: number } | undefined;
export type SetContext = React.Dispatch<React.SetStateAction<Context>>;

type CardContextMenuProps = {
  children: ReactNode,
  id: number,
  disabled: boolean,
  setContext: SetContext,
};

const CardContextMenu = ({
  children, id, disabled, setContext,
}: CardContextMenuProps) => {
  const { t } = useTranslation();

  const items: MenuProps['items'] = [
    {
      label: t('contextMenu.editItem'),
      key: '1',
      onClick: () => setContext({ action: 'editItem', id }),
    },
    {
      label: t('contextMenu.removeItem'),
      key: '2',
      onClick: () => setContext({ action: 'removeItem', id }),
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['contextMenu']} disabled={disabled}>
      <div>{children}</div>
    </Dropdown>
  );
};

export default CardContextMenu;
