import CtrlText from '../CtrlText';
import React from 'react';
import { useStores } from '../../../hooks/useStores';

const UserNameForm = () => {
  const { gameStore } = useStores()

  return (
    <div className="pt-2 px-2 mt-4">
      <div className="text-center">
        Who's prompin' today?
      </div>
      <CtrlText
        id={'userName'}
        singleUse={true}
        label={'Name'}
        messageField='userName'
        hasSubmit={true}
        onSubmitSuccess={(name: string | null) => {
          gameStore.setUserName(name)
        }}
      />
    </div>
  )
}

export default UserNameForm