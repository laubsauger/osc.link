import ListItemAudience from './ListItemAudience';
import React from 'react';
import { useStores } from '../../../hooks/useStores';
import { observer } from 'mobx-react-lite';

const ListAudience = () => {
  const { gameStore } = useStores()

  return (
    <div className="p-2">
      <div className="mb-2 d-flex justify-content-between text-dark">
        <span>Audience</span>
      </div>
      <div className="m-0 px-2">
        <div className="limited-length-list" style={{ fontSize: '12px' }}>
          {gameStore.audience?.map((user, index) => (
            <ListItemAudience player={user} key={`${user.id}_${index}`}/>
          ))}
        </div>
      </div>
    </div>
)
}

export default observer(ListAudience)