import React from 'react'
import { observer } from 'mobx-react-lite';
import { Phase4RoundData } from '../../../../stores/gameStore';
import { motion } from 'framer-motion';

const RoundEnd = () => {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center w-100"
       style={{ height: 'calc(100dvh - 96px)', width: '100vw' }}
    >
      <div className="p-2 mt-2 text-center flex-grow-1 w-100 d-flex flex-column justify-content-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }} transition={{ duration: 0.5, ease: 'backOut' }}
        >
          <div className="fs-4 fw-bold">Pencils down!</div>
        </motion.div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5, ease: 'backOut' }}
        >
          <div className="fs-5 d-flex flex-column z-index-above mt-2">
            Submissions are in
          </div>
        </motion.div>
      </div>

      <div className="w-100 px-4">
        <motion.div
          initial={{ y: '100vh' }}
          animate={{ y: 0 }}
          transition={{ delay: 1, duration: 0.5, ease: 'backOut' }}
        >
          <div
            className="w-100 d-flex flex-column justify-content-center align-items-center position-relative overflow-hidden rounded-4 mb-3 py-2"
            style={{ background: 'rgb(25,25,25)' }}
          >
            <div className="mb-2" style={{ color: '#0a73d5' }}>Awaiting results</div>
            <div className="dot-floating mb-2"></div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default observer(RoundEnd)