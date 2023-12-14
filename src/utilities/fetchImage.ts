const fetchImage = async (img: string, setState?: React.Dispatch<React.SetStateAction<string>>) => {
  if (process.env.NODE_ENV === 'development') {
    const response = await import(`../images/market/${img}`);
    return setState ? setState(response.default.src) : response.default.src;
  }
  return setState ? setState(`${process.env.PUBLIC_URL}/_next/static/media/${img}`) : `${process.env.PUBLIC_URL}/_next/static/media/${img}`;
};

export default fetchImage;
