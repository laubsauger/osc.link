import React from 'react';
import { useStores } from '../../../../hooks/useStores';
import { observer } from 'mobx-react-lite';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '../../../../stores/socketStore';
import { Result } from './Voting';
import ResultsImageGallery from '../ImageGallery/ResultsImageGallery';
import ListItemPlayer from '../ListItemPlayer';

const Points = () => {
  const { gameStore, socketStore } = useStores();

  // Get the max points
  const maxPoints = Math.max.apply(Math, gameStore?.pointsData?.points ? gameStore?.pointsData?.points.map((item) => item.pointsPrev + item.pointsDiff) : [0]);

  console.log({maxPoints})

  const barVariants = {
    hidden: { width: 0 },
    visible: (pointsPercentage: number) => ({
      width: `${pointsPercentage}%`,
      transition: {
        delay: 3,
        duration: 5,
        ease: 'easeInOut'
      }
    }),
  };

  const prevVariants = {
    hidden: { width: 0 },
    visible: (pointsPercentage: number) => ({
      width: `${pointsPercentage}%`,
      transition: {
        delay: 1,
        duration: 1,
        ease: 'easeInOut'
      }
    }),
  }

  return (
    <div className="d-flex flex-column" style={{ height: '100vh', width: '100vw' }}>
      <div className="p-2 text-center w-100 d-flex flex-column">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, ease: 'backOut' }}
        >
          <div className="fs-4 fw-bold">Scores</div>
        </motion.div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.5,
            duration: 0.5,
            ease: 'backOut'
          }}
        >
          {gameStore?.pointsData?.points.map((playerData, index) => {
            // Calculate points as a percentage of the max
            const pointsPercentagePrev = (playerData.pointsPrev / maxPoints) * 100;
            const pointsPercentageDiff = (playerData.pointsDiff / maxPoints) * 100;

            return (
              <div key={index}>
                <div className="fs-5 d-flex flex-column z-index-above mt-2 mb-2">
                  {`Player ${playerData.player_index}`} | Prev {playerData.pointsPrev} | Points {playerData.points} | Added {playerData.pointsDiff}
                </div>
                <motion.div
                  className="points-bar"
                  initial="hidden"
                >
                  <motion.div
                    className="points-bar-prev"
                    variants={prevVariants}
                    initial="hidden"
                    animate="visible"
                    custom={pointsPercentagePrev}
                  ></motion.div>
                  <motion.div
                    className="points-bar-diff"
                    variants={barVariants}
                    initial="hidden"
                    animate="visible"
                    custom={pointsPercentageDiff}
                  ></motion.div>
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default observer(Points);