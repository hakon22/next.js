import {
  DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional,
} from 'sequelize';
import { db } from '../connect.js';
import type { Addresses } from '../../types/Addresses.js';

export interface UserModel
  extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
  id?: CreationOptional<number>;
  username: string;
  password: string;
  email: string;
  phone: string;
  role: string;
  refresh_token: string[] | null;
  code_activation?: string | null;
  change_email_code?: string;
  addresses: Addresses;
  orders: number[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PassportRequest {
  dataValues: UserModel;
  token: string;
  refreshToken: string;
}

const Users = db.define<UserModel>(
  'Users',
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    refresh_token: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
    },
    code_activation: {
      type: DataTypes.STRING,
    },
    change_email_code: {
      type: DataTypes.STRING,
    },
    addresses: {
      type: DataTypes.JSON,
      defaultValue: {
        addressList: [],
        currentAddress: -1,
      },
    },
    orders: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: [],
    },
  },
);

export default Users;
