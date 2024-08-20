import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite'
});

interface InstanceAttributes {
  id: number;
  name: string;
  description: string;
  settings: object;
}

interface InstanceCreationAttributes extends Optional<InstanceAttributes, 'id'> {}

class Instance extends Model<InstanceAttributes, InstanceCreationAttributes> implements InstanceAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public settings!: object;
}

Instance.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
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
    }
  },
  {
    sequelize,
    modelName: 'Instance'
  }
);

export { sequelize, Instance };