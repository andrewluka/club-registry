import { useState, useEffect } from "react";
import { IpcRenderer } from "electron";

const ipcRenderer: IpcRenderer = window.require("electron").ipcRenderer;

interface Options<T> {
  getData: () => T[];
  ipcChannels: string[];
}

export const getIpcUsingHook = <T>({ getData, ipcChannels }: Options<T>) => {
  const useData = () => {
    const [data, setData] = useState(getData());

    const refresh = () => setData(getData());

    useEffect(() => {
      const channels = [...new Set(ipcChannels)];

      for (const channel of channels) {
        ipcRenderer.on(channel, refresh);
      }

      return () => {
        for (const channel of channels) {
          ipcRenderer.removeListener(channel, refresh);
        }
      };
    }, []);

    return { data, refresh };
  };

  return useData;
};
