/* eslint-disable max-len */
import { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'next/navigation';
import {
  Collapse, Select, Slider, FloatButton, Drawer,
} from 'antd';
import {
  Filter, Funnel, SortAlphaDown, SortDown, SortDownAlt,
} from 'react-bootstrap-icons';
import { Button } from 'react-bootstrap';
import type { CollapseProps } from 'antd';
import { MobileContext } from './Context';
import type { Item } from '../types/Item';
import scrollTop from '../utilities/scrollTop';

export type FilterOptions = {
  sortBy?: 'name' | 'overPrice' | 'lowerPrice';
  rangePriceValue?: number[];
  rangeCcalValue?: number[];
  isClear?: boolean;
}

type FilterProps<T> = {
  filterOptions: FilterOptions,
  setFilterOptions: React.Dispatch<React.SetStateAction<FilterOptions>>,
  setShowData: React.Dispatch<React.SetStateAction<T[]>>,
  search?: T[],
  sortedItems: T[],
  currentItems: T[],
  showedItemsCount: number,
};

type SliderValue = number[] | undefined;

const sortByName = (a: Item, b: Item) => {
  if (a.name > b.name) {
    return 1;
  }
  if (a.name < b.name) {
    return -1;
  }
  return 0;
};

const sortByOverPrice = (a: Item, b: Item) => (b.discountPrice || b.price) - (a.discountPrice || a.price);
const sortByLowerPrice = (a: Item, b: Item) => (a.discountPrice || a.price) - (b.discountPrice || b.price);

const sortByRangePrice = (priceValue: SliderValue) => (a: Item) => {
  const { price, discountPrice } = a;
  const actualPrice = discountPrice || price;
  return priceValue?.length
      && (actualPrice >= priceValue[0]) && (actualPrice <= priceValue[1]);
};

const sortByRangeCcal = (...values: SliderValue[]) => (a: Item) => values[1]?.length && Number(a.foodValues.ccal) >= values[1][0] && Number(a.foodValues.ccal) <= values[1][1];

const sortByRange = (priceValue: SliderValue, ccalValue: SliderValue) => (a: Item) => {
  const { price, discountPrice, foodValues: { ccal } } = a;
  const actualPrice = discountPrice || price;
  return (priceValue?.length
      && (actualPrice >= priceValue[0]) && (actualPrice <= priceValue[1]))
      && (ccalValue?.length && ccal >= ccalValue[0] && ccal <= ccalValue[1]);
};

const getSortFunction = (sortBy: string | undefined) => {
  if (sortBy === 'overPrice') {
    return sortByOverPrice;
  }
  if (sortBy === 'lowerPrice') {
    return sortByLowerPrice;
  }
  return sortByName;
};

const getFilterFunction = (priceValue: SliderValue, ccalValue: SliderValue) => {
  if (priceValue && !ccalValue) {
    return sortByRangePrice;
  }
  if (!priceValue && ccalValue) {
    return sortByRangeCcal;
  }
  return sortByRange;
};

export const generalSortFunction = (sortBy: string | undefined) => (a: Item, b: Item) => getSortFunction(sortBy)(a, b);
export const generalFilterFunction = (...values: [SliderValue, SliderValue]) => (a: Item) => getFilterFunction(...values)(...values)(a);

export const isFilter = (value1: unknown, value2: unknown) => !!(value1 || value2);

const Filters = ({
  filterOptions, setFilterOptions, setShowData, search, sortedItems, currentItems, showedItemsCount,
}: FilterProps<Item>) => {
  const { t } = useTranslation();

  const urlParams = useSearchParams();
  const urlPage = Number(urlParams.get('page'));

  const isMobile = useContext(MobileContext);

  const [showDrawer, setShowDrawer] = useState(false);

  const {
    sortBy, rangePriceValue, rangeCcalValue, isClear,
  } = filterOptions;

  const prices = search
    ? search.map(({ price, discountPrice }) => discountPrice || price)
    : currentItems.map(({ price, discountPrice }) => discountPrice || price);

  const ccals = search
    ? search.map(({ foodValues: { ccal } }) => ccal)
    : currentItems.map(({ foodValues: { ccal } }) => ccal);

  const rangePrice = [Math.min(...prices), Math.max(...prices)];
  const rangeCcal = [Math.min(...ccals), Math.max(...ccals)];

  const isDisabled = (num1: number, num2: number) => num1 === num2;

  const pageShowedData = sortedItems.length > showedItemsCount && urlPage > 1
    ? urlPage * showedItemsCount - showedItemsCount
    : 0;

  const [rangePriceValues, setRangePriceValues] = useState(rangePrice);
  const [rangeCcalValues, setRangeCcalValues] = useState(rangeCcal);

  const countFilters = () => {
    if (rangePriceValue && rangeCcalValue) return 2;
    if (rangePriceValue || rangeCcalValue) return 1;
    return 0;
  };

  const items: CollapseProps['items'] = [
    {
      key: '1',
      label: (
        <span>
          <Filter className="me-2" />
          {t('filters.sorts.title')}
        </span>),
      children: <Select
        defaultValue={sortBy}
        className="w-100"
        onChange={(value) => setFilterOptions({ sortBy: value, rangePriceValue, rangeCcalValue })}
        options={[
          {
            value: 'name',
            label: (
              <span>
                <SortAlphaDown className="me-2" />
                {t('filters.sorts.byName')}
              </span>),
          },
          {
            value: 'overPrice',
            label: (
              <span>
                <SortDown className="me-2" />
                {t('filters.sorts.byOverPrice')}
              </span>),
          },
          {
            value: 'lowerPrice',
            label: (
              <span>
                <SortDownAlt className="me-2" />
                {t('filters.sorts.byLowerPrice')}
              </span>),
          },
        ]}
      />,
    },
    {
      key: '2',
      label: (
        <span>
          <Funnel className="me-2" />
          {t('filters.filters.title')}
        </span>),
      children: (
        <div className="d-flex flex-column gap-2">
          <div className="text-center">
            <span className="fw-bold">{t('filters.filters.price')}</span>
            <div className="d-flex justify-content-between">
              <span>{t('filters.filters.from')}</span>
              <span>{t('filters.filters.to')}</span>
            </div>
            <Slider
              range={{ draggableTrack: true }}
              tooltip={{ formatter: (value?: number) => `${value} ${t('createItem.rubSymbol')}` }}
              min={rangePrice[0]}
              max={rangePrice[1]}
              value={rangePriceValues}
              defaultValue={rangePrice}
              disabled={isDisabled(rangePrice[0], rangePrice[1])}
              onChange={(value: number[]) => setRangePriceValues(value)}
              onChangeComplete={(value: number[]) => setFilterOptions({ sortBy, rangeCcalValue, rangePriceValue: value })}
            />
          </div>
          <div className="text-center">
            <span className="fw-bold">{t('filters.filters.ccal')}</span>
            <div className="d-flex justify-content-between">
              <span>{t('filters.filters.from')}</span>
              <span>{t('filters.filters.to')}</span>
            </div>
            <Slider
              range={{ draggableTrack: true }}
              tooltip={{ formatter: (value?: number) => `${value} ${t('createItem.ccal')}` }}
              min={rangeCcal[0]}
              max={rangeCcal[1]}
              value={rangeCcalValues}
              defaultValue={rangeCcal}
              disabled={isDisabled(rangeCcal[0], rangeCcal[1])}
              onChange={(value: number[]) => setRangeCcalValues(value)}
              onChangeComplete={(value: number[]) => setFilterOptions({ sortBy, rangePriceValue, rangeCcalValue: value })}
            />
          </div>
        </div>),
    },
    {
      key: 3,
      showArrow: false,
      collapsible: 'icon',
      label: (
        <Button
          variant="warning"
          size="sm"
          onClick={() => setFilterOptions({ sortBy, isClear: true })}
          disabled={isClear || !isFilter(rangePriceValue, rangeCcalValue)}
        >
          {t('filters.clearFilters')}
        </Button>),
    },
  ];

  useEffect(() => {
    if (isFilter(rangePriceValue, rangeCcalValue)) {
      const filteredItems = sortedItems.filter(generalFilterFunction(rangePriceValue, rangeCcalValue));
      setShowData(filteredItems.slice(pageShowedData, pageShowedData
        ? filteredItems.length
        : showedItemsCount));
      scrollTop();
      if (isMobile) {
        setShowDrawer(false);
      }
    }
  }, [rangePriceValue, rangeCcalValue]);

  useEffect(() => {
    if (sortBy) {
      if (isFilter(rangePriceValue, rangeCcalValue)) {
        setShowData(sortedItems
          .filter(generalFilterFunction(rangePriceValue, rangeCcalValue))
          .sort(generalSortFunction(sortBy))
          .slice(pageShowedData, pageShowedData ? sortedItems.length : showedItemsCount));
      } else {
        setShowData(sortedItems
          .sort(generalSortFunction(sortBy))
          .slice(pageShowedData, pageShowedData ? sortedItems.length : showedItemsCount));
      }
      scrollTop();
      if (isMobile) {
        setShowDrawer(false);
      }
    }
  }, [sortBy]);

  useEffect(() => {
    if (isClear) {
      setRangePriceValues([-Infinity, Infinity]);
      setRangeCcalValues([-Infinity, Infinity]);
      scrollTop();
      if (isMobile) {
        setShowDrawer(false);
      }
    }
  }, [isClear]);

  return isMobile ? (
    <>
      <FloatButton
        style={{ left: '6.5%', top: '50%' }}
        badge={{
          count: countFilters(),
        }}
        icon={<Funnel />}
        onClick={() => setShowDrawer(true)}
      />
      <Drawer
        placement="left"
        title={t('filters.title')}
        width="80%"
        onClose={() => setShowDrawer(false)}
        open={showDrawer}
      >
        <Collapse
          defaultActiveKey={['1']}
          items={items}
          expandIconPosition="end"
        />
      </Drawer>
    </>
  ) : (
    <Collapse
      className="position-absolute start-0"
      style={{ width: '20vw' }}
      defaultActiveKey={['1']}
      items={items}
      expandIconPosition="end"
    />
  );
};

Filters.defaultProps = {
  search: undefined,
};

export default Filters;
