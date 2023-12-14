/* eslint-disable react/jsx-closing-tag-location */
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AutoComplete } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { toLower } from 'lodash';
import { Button } from 'react-bootstrap';
import fetchImage from '../utilities/fetchImage';
import { useAppDispatch } from '../utilities/hooks';
import { searchUpdate } from '../slices/marketSlice';
import routes from '../routes';
import type { Item } from '../types/Item';

type Data = { name: string, image: string }[];

const Search = ({ items }: { items: Item[] }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [search, setSearch] = useState<string>();
  const [data, setData] = useState<Data>([]);

  const urlParams = useSearchParams();
  const urlPage = Number(urlParams.get('page'));
  const urlSearch = urlParams.get('q');

  const searchHandler = (searchedValue: string | undefined) => {
    const actions = (values: Item[] | null, url: string) => {
      dispatch(searchUpdate(values));
      router.push(url);
    };
    setSearch(searchedValue);
    if (!searchedValue) {
      actions(null, routes.homePage);
    } else {
      const result = items.filter(({ name, composition }) => {
        const query = toLower(searchedValue);
        return toLower(name).includes(query) || toLower(composition).includes(query);
      });
      if (result.length) {
        actions(result, `/?q=${searchedValue}&page=${urlPage}`);
      } else {
        actions(null, `/search?q=${searchedValue}`);
      }
      const target = document.body;
      target.parentElement?.focus();
    }
  };

  const onSearch = async (q: string) => {
    const images: string[] = [];
    const result = items.filter(({ name, composition, image }) => {
      const query = toLower(q);
      images.push(image);
      return toLower(name).includes(query) || toLower(composition).includes(query);
    });
    const fetchedData = await Promise.all(result.map(async ({ name, image }) => {
      const fetchedImage = await fetchImage(image);
      return { name, image: fetchedImage };
    }));
    setData(fetchedData);
  };

  const options = (d: Data) => d.map(({ name, image }) => ({
    label: <Button
      onClick={() => {
        searchHandler(name);
      }}
      className="ant-select-item ant-select-item-option ant-select-item-option-active"
      title={name}
    >
      <div className="ant-select-item-option-content d-flex align-items-center gap-2">
        <img className="col-2" alt={name} src={image} />
        <span className="fs-6">{name}</span>
      </div>
    </Button>,
  }));

  const handleChange = (value: string) => setSearch(value);

  const clearData = () => {
    setSearch(undefined);
    setData([]);
  };

  useEffect(() => {
    if (urlSearch && items.length) {
      searchHandler(urlSearch);
      onSearch(urlSearch);
    } else if (search) {
      clearData();
      dispatch(searchUpdate(null));
    }
  }, [items, urlSearch]);

  return (
    <AutoComplete
      value={search}
      className="d-flex col-md-10"
      placeholder={t('navBar.search')}
      notFoundContent={search && (<span className="ps-2 text-muted">{t('search.header')}</span>)}
      allowClear
      suffixIcon={<SearchOutlined />}
      onClear={clearData}
      options={options(data)}
      onSearch={onSearch}
      onChange={handleChange}
      onInputKeyDown={({ key }) => {
        if (key === 'Enter') {
          searchHandler(search);
        }
      }}
      status="warning"
    />
  );
};

export default Search;
