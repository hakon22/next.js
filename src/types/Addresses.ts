export type Address = {
  city: string;
  street: string;
  house: string;
  building?: string;
  floor?: string;
  intercom?: string;
  frontDoor?: string;
  apartment?: string;
  comment?: string;
};

export type Addresses = {
  addressList: Address[];
  currentAddress: string | number | bigint;
};