import React, { useEffect, useState } from 'react'
import { useStores } from '../../../../hooks/useStores';
import { observer } from 'mobx-react-lite';
import { Player } from '../../../../stores/socketStore';
import { Phase2PlayerData } from 'src/stores/gameStore';
import ListItemPlayer from '../ListItemPlayer';
import ListAudience from '../ListAudience';
import { buttonColors } from '../../index';

const Players = ({ data }: { data: Phase2PlayerData}) => {
  const { socketStore, gameStore } = useStores()

  useEffect(() => {
    if (!data.player_indexes) {
      return
    }
    // console.log(data.player_indexes)
    const playerData = data.player_indexes.map((player_index, index) => {
      // console.log(player_index, socketStore.roomState.users)
      const player =  socketStore.roomState.users?.filter(user => user.client_index === player_index)[0]
      return {
        ...player,
        color: buttonColors[index],
        points: 0,
      }
    }) as Player[]

    const audienceData = socketStore.roomState.users?.filter(user => !data.player_indexes.includes(user.client_index))

    gameStore.setPlayers(playerData)
    gameStore.setAudience(audienceData)
  }, [data, socketStore.roomState.users]);

  return (
    <div>
      {gameStore.players ?
          <div className="p-2">
            <div className="px-2 mb-2 d-flex justify-content-between">
              <span>Players selected for the next round:</span>
            </div>
            <div className="m-0 px-3 d-flex flex-column gap-2">
                {gameStore.players?.map((player, index) => (
                  <ListItemPlayer key={`${player.id}_${index}`} player={player} index={index} />
                ))}
            </div>
          </div>
        : <div>Fetching Players...</div>
        }
        { gameStore.audience
          ? <ListAudience />
          : <div>Fetching Audience...</div>
        }
    </div>
  )
}

export default observer(Players)