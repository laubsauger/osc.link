import User from './User';
import Instance from './Instance';

const defineAssociations = () => {
  User.hasMany(Instance, { foreignKey: "userId", as: "instances" });
  Instance.belongsTo(User, { foreignKey: "userId", as: "user" });
};

export default defineAssociations;