import { motion } from 'framer-motion';
import { Badge } from 'react-bootstrap';
import React from 'react';
import { observer } from 'mobx-react-lite';
import { Phase1SplashData } from '../../../../stores/gameStore';

const Splash = ({data}: { data: Phase1SplashData}) => {
  return (
    <div className="position-absolute w-100 h-100 z-index-above d-flex flex-column align-items-center bg-black justify-content-center overflow-hidden">
      <motion.img
        src={data.image}
        alt={data.title}
        className="position-absolute w-auto mw-100 h-100"
        style={{ objectFit: 'cover', objectPosition: 'center' }}
        animate={{ scale: 1, opacity: 1}}
        initial={{ scale: 200, opacity: 0 }}
        transition={{ ease: "easeOut", duration: 1 }}
      />

      <div className="h-100 p-2 d-flex flex-column align-items-center justify-content-between z-index-above">
        <motion.div
          initial={{scale: 3, opacity: 0}}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 2, ease: 'backOut',  duration: 0.5 }}
        >
          <div
            className="fw-bold fs-2 text-white p-4 rounded-4"
            style={{ boxShadow: '0 0.75rem 2rem rgb(0 0 0)', backgroundColor: 'rgba(0,0,0,0.85)' }}
          >
            {data.title}
          </div>
        </motion.div>
        <div>
          <motion.div
            initial={{ scale: 3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 2.5, ease: 'backOut', duration: 0.5 }}
          >
            <div
              className="fs-3 text-primary px-3 py-3 rounded-4 mb-3"
              style={{ boxShadow: '0 0.75rem 2rem rgb(0 0 0)', backgroundColor: 'rgba(0,0,0,0.85)' }}
            >
              <div className="fs-6 text-light font-monospace">
                {data.description}
              </div>

              <hr className="my-2"/>

              <div className="fs-5 d-flex gap-2 justify-content-between">
                <Badge pill bg="dark" className="fw-medium text-black">
                  {data.player_count} Players
                </Badge>
                <Badge pill bg="dark" className="fw-medium text-black">
                  Crowd Vote
                </Badge>
              </div>
            </div>

            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              transition={{ delay: 3, ease: 'backOut', duration: 0.5 }}
            >
              <div
                className="d-flex flex-column justify-content-center align-items-center position-relative overflow-hidden rounded-4 p-1 mb-3"
                style={{ boxShadow: '0 0.75rem 2rem rgb(0 0 0)', backgroundColor: 'rgba(0,0,0,0.85)' }}
              >
                <div className="mb-2" style={{ color: '#0a73d5' }}>Awaiting player selection</div>
                <div className="dot-floating mb-2"></div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default observer(Splash)