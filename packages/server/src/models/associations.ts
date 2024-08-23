import Admin from './Admin';
import Instance from './Instance';

const defineAssociations = () => {
  Admin.hasMany(Instance, { foreignKey: "userId", as: "instances" });
  Instance.belongsTo(Admin, { foreignKey: "userId", as: "user" });
};

export default defineAssociations;