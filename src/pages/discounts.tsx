/* eslint-disable max-len */
import type { InferGetServerSidePropsType } from 'next';
import store from '@/slices/index';
import { fetchItems } from '@/slices/marketSlice';
import { fetchingItemsImage } from '@/utilities/fetchImage';
import type { Item } from '@/types/Item';
import Marketplace from './index';

export const getServerSideProps = async () => {
  const items = await (await store.dispatch(fetchItems())).payload.items;
  const fetchedItems = await fetchingItemsImage<Item>(items);

  return {
    props: {
      items: fetchedItems,
      filterItems: fetchedItems.filter((i) => !!i.discount),
    },
  };
};

const Catalog = ({ items, filterItems }:
  InferGetServerSidePropsType<typeof getServerSideProps>) => <Marketplace items={items} filterItems={filterItems} />;

export default Catalog;
