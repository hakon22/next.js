const fetchImage = async (img: string, setState?: React.Dispatch<React.SetStateAction<string>>) => {
  const response = await import(`../images/market/${img}`);
  return setState ? setState(response.default.src) : response.default.src;
};

export const fetchingItemsImage = async <T extends { image: string }> (items: T[]) => {
  const values = Object.values<T>(items)
    .map(async (item) => ({ ...item, image: await fetchImage(item.image) }));
  const fetchedItems = await Promise.all(values);
  return fetchedItems;
};

export default fetchImage;
