import { Player } from '../../../stores/socketStore';
import { useStores } from '../../../hooks/useStores';
import React from 'react';
import { observer } from 'mobx-react-lite';

const ListItemAudience = ({player}:{player: Player}) => {
  const { socketStore } = useStores()

  return (
    <div>
        {player.id === socketStore.connectionState.clientId
          ? <div className="text-info fw-bold">
            {player.client_index}:{player.name ? player.name : player.id.slice(0, 6)}
          </div>
          : <div>{player.client_index}:{player.name ? player.name : player.id.slice(0, 6)}</div>
        }
    </div>
  )
}
export default observer(ListItemAudience)