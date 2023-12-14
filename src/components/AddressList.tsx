import { XLg, PencilFill } from 'react-bootstrap-icons';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { MobileContext } from './Context';
import { useAppDispatch, useAppSelector } from '../utilities/hooks';
import { fetchRemoveAddress, fetchSelectAddress } from '../slices/loginSlice';
import type { Addresses } from '../types/Addresses';

interface DataType {
  key: React.Key;
  city: string;
  street: string;
  house: string;
}

type AddressListProps = {
  addresses?: Addresses;
  actions: {
    setEditingIndexAddress: (arg: number) => void;
    setLoading: (arg: boolean) => void;
  }
};

const AddressList = ({ addresses, actions }: AddressListProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const isMobile = useContext(MobileContext);
  const { token } = useAppSelector((state) => state.login);
  const { setEditingIndexAddress, setLoading } = actions;

  const { addressList, currentAddress } = addresses ?? { addressList: [], currentAddress: -1 };

  const columns: ColumnsType<DataType> = [
    {
      dataIndex: 'select',
      className: 'cursor-pointer',
    },
    {
      title: t('profile.addressForm.addressList.city'),
      dataIndex: 'city',
      align: 'center',
      className: 'cursor-pointer',
    },
    {
      title: t('profile.addressForm.addressList.street'),
      dataIndex: 'street',
      align: 'center',
      className: 'cursor-pointer',
    },
    {
      title: t('profile.addressForm.addressList.house'),
      dataIndex: 'house',
      align: 'center',
      className: 'cursor-pointer',
    },
    {
      dataIndex: 'update',
      className: 'non-select',
      render: (text, record, index) => (
        <PencilFill
          title={t('profile.addressForm.changing')}
          className="non-select d-flex align-items-center text-warning"
          role="button"
          onClick={() => setEditingIndexAddress(index)}
        />
      ),
    },
    {
      dataIndex: 'remove',
      className: 'non-select',
      render: (text, record, index) => (
        <XLg
          title={t('profile.addressForm.removing')}
          className="non-select d-flex align-items-center text-danger"
          role="button"
          onClick={async () => {
            setLoading(true);
            await dispatch(fetchRemoveAddress({ token, index }));
            setEditingIndexAddress(-1);
            setLoading(false);
          }}
        />
      ),
    },
  ];

  return (
    <Table
      className={addressList?.length ? 'mb-3' : ''}
      size={isMobile ? 'small' : 'large'}
      rowSelection={{
        type: 'radio',
        selectedRowKeys: [currentAddress],
        onChange: async ([index]) => {
          if (currentAddress !== index) {
            setLoading(true);
            await dispatch(fetchSelectAddress({ token, index }));
            setLoading(false);
          }
        },
      }}
      onRow={({ key }) => ({
        onClick: async ({ target }) => {
          const { classList, tagName } = target as HTMLElement;
          if (!classList.contains('non-select') && tagName !== 'path' && (currentAddress !== key)) {
            setLoading(true);
            await dispatch(fetchSelectAddress({ token, index: key }));
            setLoading(false);
          }
        },
      })}
      locale={{
        emptyText: t('profile.addressForm.addressesAlreadyExists'),
      }}
      pagination={false}
      columns={columns}
      showHeader={false}
      dataSource={addressList?.map(({ city, street, house }, key) => ({
        key: key + 1, city, street, house,
      }))}
    />
  );
};

AddressList.defaultProps = {
  addresses: undefined,
};

export default AddressList;
