import { motion } from 'framer-motion';
import React from 'react';
import Toast from 'react-bootstrap/Toast';

const Toasty = ({title, text, visible, onHide}:{title: string, text: string, visible?: boolean, onHide: () => void}) => {
  return (
    <div className="position-fixed d-flex align-items-center justify-content-center top-0 bottom-0 pointer-events-none">
      <Toast onClose={onHide} show={visible} delay={3000} autohide animation={true} className="pointer-event" bg={'primary'}>
        <motion.div initial={{scale: 0}} animate={{ scale: 1}} transition={{delay: 0.5, duration: 0.5, ease: 'backOut'}}>
          <div className=" w-100 h-100 ">
            <Toast.Header>
              {/*<img*/}
              {/*  src="holder.js/20x20?text=%20"*/}
              {/*  className="rounded me-2"*/}
              {/*  alt=""*/}
              {/*/>*/}
              <strong className="me-auto">{title}</strong>
              {/*<small>11 mins ago</small>*/}
            </Toast.Header>
            <Toast.Body>{text}</Toast.Body>
          </div>
        </motion.div>
      </Toast>
    </div>
  )
}

export default Toasty