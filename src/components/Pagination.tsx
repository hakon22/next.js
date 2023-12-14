import { Pagination as AntdPagination } from 'antd';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import scrollTop from '../utilities/scrollTop';
import type { Item } from '../types/Item';

type PaginationProps<T> = {
  data: T;
  setShowData: React.Dispatch<React.SetStateAction<T>>;
  rowsPerPage: number;
  scrollRef?: React.RefObject<HTMLElement>;
}

const Pagination = ({
  data, setShowData, rowsPerPage, scrollRef,
}: PaginationProps<Item[]>) => {
  const router = useRouter();
  const urlParams = useSearchParams();
  const urlPage = Number(urlParams.get('page'));
  const urlSearch = urlParams.get('q');

  const lastPage = Math.ceil(data.length / rowsPerPage);

  const paramsCheck = (value: number) => (value <= lastPage && value > 0 ? value : 1);

  const pageParams: number = paramsCheck(urlPage);
  const [currentPage, setCurrentPage] = useState(pageParams);

  const handleClick = (page: number) => {
    setCurrentPage(page);
    const pageIndex = page - 1;
    const firstIndex = pageIndex * rowsPerPage;
    const lastIndex = pageIndex * rowsPerPage + rowsPerPage;
    setShowData(data.slice(firstIndex, lastIndex));
    if (urlSearch) {
      router.push(`?q=${urlSearch}&page=${page}`);
    } else {
      router.push(`?page=${page}`);
    }
  };

  useEffect(() => {
    setTimeout(() => handleClick(pageParams), 1);
  }, [data]);

  useEffect(() => {
    if (scrollRef) {
      scrollRef?.current?.scrollIntoView();
    } else {
      setTimeout(scrollTop, 100);
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
