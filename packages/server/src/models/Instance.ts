import { DataTypes, Model, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../database';


class Instance extends Model {
  public id!: number;
  public name!: string;
  public description?: string;
  public settings?: object;
  public userId!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Instance.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      // use hashing
      // todo: consider collision
      defaultValue: uuidv4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    settings: {
      type: DataTypes.JSON,
      allowNull: true
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'Instance'
  }
);

export default Instance;