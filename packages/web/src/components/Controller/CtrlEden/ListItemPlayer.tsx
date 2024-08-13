import { Player } from '../../../stores/socketStore';
import { useStores } from '../../../hooks/useStores';
import React from 'react';
import { observer } from 'mobx-react-lite';
import { motion } from 'framer-motion';

const ListItemPlayer = ({player, index}:{player?: Player, index: number}) => {
  const { socketStore } = useStores()
  console.log({player})
  if (!player || !player.id) {
    return (
      <div className="text-light">unknown</div>
    )
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.35, ease: 'backOut', delay: 0.35 * (index + 1) }}
      className={`CtrlButton-${player.color} player d-flex align-items-center justify-content-center w-50`}
    >
      {player.id === socketStore.connectionState.clientId
        ? <div className="text-info fw-bold">{player.client_index}:{player.name ? player.name : player.id.slice(0, 6)}</div>
        : <div>{player.client_index}:{player.name ? player.name : player.id.slice(0, 6)}</div>
      }
    </motion.div>
  )
}
export default observer(ListItemPlayer)