import React from "react";
import "./styles.scss";
import { observer } from "mobx-react-lite";
import { useStores } from "../../hooks/useStores";
import { useAuth } from "@clerk/clerk-react";

type Props = {
  size?: string;
};

const InstanceEditor = (props: Props) => {
  const { size } = props;

  const { socketStore, gameStore } = useStores();
  const { getToken } = useAuth();

  const instance = socketStore.currentInstance;

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
    let updatedControls;
    try {
      updatedControls = JSON.parse(value);
    } catch (error) {
      console.error("Invalid JSON format:", error);
      alert("Invalid JSON format");
      return;
    }

    const updatedInstance = {
      ...instance,
      settings: {
        ...instance.settings,
        controls: updatedControls,
      },
    };
    // @ts-ignore
    socketStore.setCurrentInstance(updatedInstance);
  };

  return (
    <div className="InstanceEditor">
      <h1 style={{ color: "white" }}>Edit Instance</h1>
      {/* 
        Todo: Edit everything about the instance.
        Name, settings, description, etc.
      */}
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={instance?.name}
            onChange={handleChange}
          />
        </label>
        <label>
          Description:
          <textarea
            name="description"
            value={instance?.description}
            onChange={handleChange}
          />
        </label>
        {instance?.settings.slots !== undefined && (
          <label>
            Slots:
            <input
              type="number"
              name="slots"
              value={instance?.settings.slots}
              onChange={handleSettingsChange}
            />
          </label>
        )}
        <label>
          Pick Type:
          <select
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
          </select>
        </label>
        {instance?.settings.layout?.wrapButtons !== undefined && (
          <label>
            Wrap Buttons:
            <input
              type="checkbox"
              name="wrapButtons"
              checked={instance?.settings.layout.wrapButtons || false}
              onChange={handleSettingsChange}
            />
          </label>
        )}
        {instance?.settings.controls && (
          <label>
            Controls (JSON):
            <textarea
              name="controls"
              value={JSON.stringify(instance.settings.controls, null, 2)}
              onChange={handleControlsChange}
              rows={10}
              cols={50}
            />
          </label>
        )}
        <button type="submit">Save Changes</button>
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
