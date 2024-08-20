import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Instance from './Instance';

class User extends Model {
  public id!: string;
  public email!: string;
  public createdAt!: Date;
  public updatedAt!: Date;

  public createInstance!: (instance: { name: string; description?: string; settings?: object }) => Promise<Instance>;
}

User.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  sequelize,
  modelName: 'User',
});

export default User;