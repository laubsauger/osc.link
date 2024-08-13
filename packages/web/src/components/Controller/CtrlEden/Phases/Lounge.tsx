import React from 'react'
import { useStores } from '../../../../hooks/useStores';
import { observer } from 'mobx-react-lite';
import ConfirmStartModal from './ConfirmStartModal';

const Lounge = () => {
  const { socketStore, gameStore } = useStores()
  return (
    <div>
      <div
        className="text-center fs-6 fw-bold px-2 p-1 bg-body border-bottom d-flex gap-2 align-items-center justify-content-between">
        <div>MBP - Lounge</div>
        <div className="d-flex justify-content-end p-0">
          <ConfirmStartModal/>
        </div>
      </div>
      <hr className="m-2 mt-0"/>
      <div>
        <div>
          <div className="px-2 mb-4 d-flex flex-column">
            <span>Game</span>
            <div className="mt-2" style={{ fontSize: '12px' }}>
              <div style={{ maxWidth: '100%' }} className='font-monospace'>
                One-shot Prompts
              </div>
            </div>
          </div>
        </div>
        <div className="px-2 mb-2 d-flex justify-content-between">
          <span>Users</span>
          <span
            className="fs-6 text-light">{socketStore.roomState.users?.length} / {socketStore.roomState.numMaxUsers}</span>
        </div>
        <div className="m-0 px-2">
          <div className="limited-length-list" style={{ fontSize: '12px' }}>
            {socketStore.roomState.users?.map((user, index) => (
              // { dummyList?.map((user, index) =>(
              <div style={{ maxWidth: '100%' }} className='font-monospace' key={`${user.id}_${index}`}>
                <>
                  {user.id === socketStore.connectionState.clientId
                    ? <div
                      className="text-info fw-bold text-truncate">{user.client_index}:{user.name ? user.name : user.id.slice(0, 6)}</div>
                    : <div>{user.client_index}:{user.name ? user.name : user.id.slice(0, 6)}</div>
                  }
                </>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/*<Toasty title={`Hi, ${gameStore.userName}!`} text={"Take a seat, we'll get going soon"} visible={showWelcome} onHide={() => setShowWelcome(false)} />*/}
    </div>
  )
}

export default observer(Lounge)