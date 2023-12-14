import {
  DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional,
} from 'sequelize';
import { db } from '../connect.js';

interface ItemsModel
  extends Model<InferAttributes<ItemsModel>, InferCreationAttributes<ItemsModel>> {
  id?: CreationOptional<number>;
  name: string;
  image: string;
  unit: string;
  price: number;
  discountPrice: number;
  count: number;
  discount: number;
  composition: string;
  foodValues: {
    carbohydrates: number,
    fats: number,
    proteins: number,
    ccal: number,
  },
  category: string[];
}

const Items = db.define<ItemsModel>(
  'Items',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    discountPrice: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    composition: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    discount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    foodValues: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    category: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
  },
);

export default Items;
