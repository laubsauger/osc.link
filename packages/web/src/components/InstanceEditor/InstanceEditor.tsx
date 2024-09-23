import React, { useEffect, useState } from "react";
import "./styles.scss";
import { observer } from "mobx-react-lite";
import { useStores } from "../../hooks/useStores";
import { useAuth } from "@clerk/clerk-react";
import { Button, Form } from "react-bootstrap";

type Props = {
  size?: string;
};

const InstanceEditor = (props: Props) => {
  const { size } = props;

  const { socketStore, gameStore } = useStores();
  const { getToken } = useAuth();
  
  const instance = socketStore.currentInstance;
  
  const [ ogSettings, setOGSettings ] = useState(JSON.stringify(instance));
  useEffect(() => {
    console.log('instance', instance)
    if (!ogSettings) {
      setOGSettings(JSON.stringify(instance));
    }
  }, [instance]);

  const [ isValidControlsJSON, setIsValidControlsJSON ] = useState(true);

  const [ draftControlsJSON, setDraftControlsJSON ] = useState(JSON.stringify(instance?.settings.controls, null, 2));
  // not available on initial load
  useEffect(() => {
    if (!draftControlsJSON) {
      setDraftControlsJSON(JSON.stringify(instance?.settings.controls, null, 2));
    }
  }, [instance]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const updatedInstance = {
      ...instance,
      [name]: value,
    };
    // @ts-ignore
    socketStore.setCurrentInstance(updatedInstance);
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedInstance = {
      ...instance,
      settings: {
        // @ts-ignore
        ...instance.settings,
        [name]: value,
      },
    };
    // @ts-ignore
    socketStore.setCurrentInstance(updatedInstance);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getToken();
    if (!isValidControlsJSON) {
      alert('Controls JSON is invalid, fix the formatting before saving.');
      return;
    }
    try {
      // @ts-ignore
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_API}/api/instances/${instance.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(instance),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update instance");
      }
      setOGSettings(JSON.stringify(instance));
      alert("Instance updated successfully");
    } catch (error) {
      console.error("Error updating instance:", error);
      alert("Failed to update instance");
    }
  };
  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    const updatedInstance = {
      ...instance,
      settings: {
        ...instance.settings,
        randomPick: value === "randomPick",
        slotPick: value === "slotPick",
        sequentialPick: value === "sequentialPick",
      },
    };
    // @ts-ignore
    socketStore.setCurrentInstance(updatedInstance);
  };

  const handleControlsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    let updatedControls, validJSON = true;
    try {
      updatedControls = JSON.parse(value);
      setIsValidControlsJSON(true)
    } catch (error) {
      console.error("Invalid JSON format:", error);
      // alert("Invalid JSON format");
      setIsValidControlsJSON(false);
      validJSON = false;
    }

    setDraftControlsJSON(value);

    // update preview only when valid json
    if (validJSON) {
      const updatedInstance = {
        ...instance,
        settings: {
          ...instance.settings,
          controls: updatedControls,
        },
      };
      // @ts-ignore
      socketStore.setCurrentInstance(updatedInstance);
    }
  };

  const hasChanges = ogSettings !== JSON.stringify(instance);
  return (
    <div className="InstanceEditor">
      <h1>Edit Instance</h1>
      {/* 
        Todo: Edit everything about the instance.
        Name, settings, description, etc.
      */}
      <form onSubmit={handleSubmit}>
        <Button 
          type="submit" 
          variant="primary" 
          disabled={!hasChanges}
        >
          {hasChanges ? "Save Changes" : "No Changes"}
        </Button>
        <Form.Group controlId="formName">
          <Form.Label>Name:</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={instance?.name}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group controlId="formDescription">
          <Form.Label>Description:</Form.Label>
          <Form.Control
            as="textarea"
            name="description"
            value={instance?.description}
            onChange={handleChange}
          />
        </Form.Group>
        {instance?.settings.slots !== undefined && (
          <Form.Group controlId="formSlots">
            <Form.Label>Slots:</Form.Label>
            <Form.Control
              type="number"
              name="slots"
              value={instance?.settings.slots}
              onChange={handleSettingsChange}
            />
          </Form.Group>
        )}
        <Form.Group controlId="formPickType">
          <Form.Label>Pick Type:</Form.Label>
          <Form.Control
            as="select"
            name="pickType"
            value={
              instance?.settings.randomPick
                ? "randomPick"
                : instance?.settings.slotPick
                ? "slotPick"
                : instance?.settings.sequentialPick
                ? "sequentialPick"
                : ""
            }
            onChange={handleDropdownChange}
          >
            <option value="randomPick">Random Pick</option>
            <option value="slotPick">Slot Pick</option>
            <option value="sequentialPick">Sequential Pick</option>
          </Form.Control>
        </Form.Group>
        {instance?.settings.layout?.wrapButtons !== undefined && (
          <Form.Group controlId="formWrapButtons">
            <Form.Check
              type="checkbox"
              name="wrapButtons"
              label="Wrap Buttons"
              checked={instance?.settings.layout.wrapButtons || false}
              onChange={handleSettingsChange}
            />
          </Form.Group>
        )}
        {instance?.settings.controls && (
          <Form.Group controlId="formControls">
            <Form.Label>Controls (JSON):</Form.Label>
            <Form.Control
              as="textarea"
              name="controls"
              value={draftControlsJSON}
              onChange={handleControlsChange}
              rows={10}
              cols={50}
            />
          </Form.Group>
        )}
      </form>
      {instance && (
        <div>
          <h3>Instance JSON:</h3>
          <pre>{JSON.stringify(instance, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default observer(InstanceEditor);
