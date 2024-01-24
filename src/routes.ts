const apiPath = '/marketplace/api';

interface ApiUrl {
  [key: string]: string;
}

interface CatalogPages {
  [key: string]: string | { pathname: string, query: { [key: string]: string[]} }
}

const pathname = '/catalog/[...catalog]';

export const catalogPages: CatalogPages = {
  discounts: '/discounts',
  delivery: '/delivery',
  vegetables: { pathname, query: { catalog: ['vegetables'] } },
  fruits: { pathname, query: { catalog: ['fruits'] } },
  frozen: { pathname, query: { catalog: ['frozen'] } },
  freshMeat: { pathname, query: { catalog: ['freshMeat'] } },
  dairy: { pathname, query: { catalog: ['dairy'] } },
  fish: { pathname, query: { catalog: ['fish'] } },
  sweet: { pathname, query: { catalog: ['sweet'] } },
  iceCream: { pathname, query: { catalog: ['sweet', 'iceCream'] } },
  chocolate: { pathname, query: { catalog: ['sweet', 'chocolate'] } },
};

export default {
  homePage: '/',
  activationPage: '/activation/:id',
  activationUrlPage: '/activation/',
  searchPage: '/search',
  profilePage: '/profile',
  ordersPage: '/orders',
  notFoundPage: '*',
  login: [apiPath, 'auth', 'login'].join('/'),
  signup: [apiPath, 'auth', 'signup'].join('/'),
  googleAuth: [apiPath, 'auth', 'google'].join('/'),
  activation: [apiPath, 'activation/'].join('/'),
  activationRepeatEmail: [apiPath, 'activation', 'repeatEmail/'].join('/'),
  activationChangeEmail: [apiPath, 'activation', 'changeEmail'].join('/'),
  logout: [apiPath, 'auth', 'logout'].join('/'),
  recoveryPassword: [apiPath, 'auth', 'recoveryPassword'].join('/'),
  updateTokens: [apiPath, 'auth', 'updateTokens'].join('/'),
  getAllItems: [apiPath, 'market', 'getAll'].join('/'),
  createItem: [apiPath, 'market', 'upload'].join('/'),
  removeItem: [apiPath, 'market', 'remove'].join('/'),
  editItem: [apiPath, 'market', 'edit'].join('/'),
  confirmEmail: [apiPath, 'profile', 'confirmEmail'].join('/'),
  changeData: [apiPath, 'profile', 'changeData'].join('/'),
  addAddress: [apiPath, 'profile', 'addAddress'].join('/'),
  removeAddress: [apiPath, 'profile', 'removeAddress'].join('/'),
  updateAddress: [apiPath, 'profile', 'updateAddress'].join('/'),
  selectAddress: [apiPath, 'profile', 'selectAddress'].join('/'),
} as ApiUrl;
