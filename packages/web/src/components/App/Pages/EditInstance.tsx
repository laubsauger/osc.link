import React, { MouseEvent, useCallback } from "react";
import { observer } from "mobx-react-lite";
import Controller from "../../Controller";
import InstanceEditor from "../../InstanceEditor/InstanceEditor";

const EditInstance: React.FC = (props) => {
  const handleReloadClick = useCallback((e: MouseEvent) => {
    e.preventDefault();
    window.location.reload();
  }, []);

  return (
    <div className="Session h-100" style={{ height: "100dvh" }}>
      {/*<div className="m-1 mt-2 p-2 small text-center z-index-above">*/}
      {/*  <Button variant="outline-warning" className="w-100" size={'sm'} onClick={handleReloadClick}>*/}
      {/*    Click here to join another free slot*/}
      {/*  </Button>*/}
      {/*</div>*/}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 3fr'
      }}>
        <InstanceEditor />
        <Controller isEditing />
      </div>
    </div>
  );
};

export default observer(EditInstance);
