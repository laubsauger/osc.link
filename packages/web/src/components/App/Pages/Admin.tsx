import React from 'react';
import { observer } from 'mobx-react-lite';
// import { useStores } from '../../../hooks/useStores';

const Admin: React.FC = (props) => {
  // const { userStore } = useStores();

  console.log('running admin')

  return (
    // <div>Functional Component for { userStore.name }</div>
    <div>Admin Dashboard</div>
  )
};

export default observer(Admin);