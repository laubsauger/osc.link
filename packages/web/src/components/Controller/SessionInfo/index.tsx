import React from 'react';
import {Col, Container, Row} from "react-bootstrap";
import { observer } from 'mobx-react-lite';
import { useStores } from "../../../hooks/useStores";
import config from "../../../config";

const SessionInfo = () => {
  const { socketStore } = useStores();

  return (
    <Container className="SessionInfo pointer-events-none position-fixed d-flex justify-content-center"  style={{ bottom: '0px', backgroundColor: 'rgba(0,0,0,1)' }}>
      <div className="text-muted font-monospace opacity-50 d-flex gap-2" style={{ fontSize: '10px' }}>
        { socketStore.connectionState.connecting && <div>Connecting to {config.socketServer}...</div> }
        {/*{ socketStore.connectionState.connected && <div className="text-success">Connected</div> }*/}
        { socketStore.connectionState.failed && <div className="text-danger">Failed to connect: {socketStore.connectionState.failReason}</div> }
        { socketStore.connectionState.joining && <div>Joining "{config.socketRoomPrefix}:{socketStore.currentInstance?.id}"...</div> }
        { socketStore.connectionState.joined &&
            <React.Fragment>
              <div className="px-2 text-success d-flex gap-2 w-100">
                <div>Room: "{config.socketRoomPrefix}:{socketStore.currentInstance?.id}" |</div>
                <div>Slot: {socketStore.roomState.currentSlot} |</div>
                <div>Online: {socketStore.roomState.users?.length}/{socketStore.roomState.numMaxUsers}</div>
              </div>
            </React.Fragment>
        }
        { socketStore.connectionState.rejected && <div className="text-warning">Join Request rejected: "{socketStore.connectionState.rejectReason}"</div> }
      </div>
    </Container>
  )
};

export default observer(SessionInfo);