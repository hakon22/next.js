/* eslint-disable max-len */
import { Pagination as AntdPagination } from 'antd';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation';
import scrollTop from '../utilities/scrollTop';
import type { Item } from '../types/Item';

type PaginationProps<T> = {
  data: T;
  setShowData: React.Dispatch<React.SetStateAction<T>>;
  rowsPerPage: number;
  scrollRef?: React.RefObject<HTMLElement>;
}

export const paramsCheck = (value: number, lastPage: number) => (value <= lastPage && value > 0 ? value : 1);

const Pagination = ({
  data, setShowData, rowsPerPage, scrollRef,
}: PaginationProps<Item[]>) => {
  const router = useRouter();
  const urlParams = useSearchParams();
  const urlPage = Number(urlParams.get('page'));
  const urlSearch = urlParams.get('q');

  const lastPage = Math.ceil(data.length / rowsPerPage);

  const pageParams: number = paramsCheck(urlPage, lastPage);
  const [currentPage, setCurrentPage] = useState(pageParams);

  const handleClick = (page: number) => {
    setCurrentPage(page);
    const pageIndex = page - 1;
    const firstIndex = pageIndex * rowsPerPage;
    const lastIndex = pageIndex * rowsPerPage + rowsPerPage;
    if (urlSearch) {
      router.push(`${router.pathname}?q=${urlSearch}&page=${page}`, undefined, { shallow: true });
    } else {
      router.push(`${router.pathname}?page=${page}`, router.query.catalog
        ? `${router.asPath}${urlPage ? '' : `?page=${page}`}`
        : `?page=${page}`, { shallow: true });
    }
    setShowData(data.slice(firstIndex, lastIndex));
  };

  useEffect(() => {
    handleClick(pageParams);
  }, [data]);

  useEffect(() => {
    if (scrollRef) {
      scrollRef?.current?.scrollIntoView();
    } else {
      setTimeout(scrollTop, 200);
    }
  }, [currentPage]);

  return (
    <AntdPagination
      className="d-flex justify-content-center align-items-center mt-5"
      current={currentPage}
      showSizeChanger={false}
      onChange={handleClick}
      total={lastPage * 10}
      disabled={!lastPage}
    />
  );
};

Pagination.defaultProps = {
  scrollRef: undefined,
};

export default Pagination;
