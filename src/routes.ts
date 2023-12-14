const apiPath = 'http://192.168.1.111:3007/marketplace/api';

interface ApiUrl {
  [key: string]: string;
}

export const catalogPages: ApiUrl = {
  discounts: '/discounts',
  delivery: '/delivery',
  vegetables: '/vegetables',
  fruits: '/fruits',
  frozen: '/frozen',
  freshMeat: '/freshMeat',
  dairy: '/dairy',
  fish: '/fish',
  sweet: '/sweet',
  iceCream: ['/sweet', 'iceCream'].join('/'),
  chocolate: ['/sweet', 'chocolate'].join('/'),
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
