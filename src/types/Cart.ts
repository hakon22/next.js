export type Cart = {
  id: number;
  name: string;
  price: number;
  unit: string;
  count: number;
  image: string;
  discount: number;
  discountPrice: number;
}

export type PriceAndCount = {
  price: number;
  discount: number;
  count: number;
}
