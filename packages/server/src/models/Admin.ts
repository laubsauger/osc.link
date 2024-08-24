import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import Instance from './Instance';

class Admin extends Model {
  public id!: string;
  public email!: string;
  public createdAt!: Date;
  public updatedAt!: Date;

  public createInstance!: (instance: { name: string; description?: string; settings?: object }) => Promise<Instance>;
}

Admin.init({
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
  modelName: 'Admin',
});

export default Admin;