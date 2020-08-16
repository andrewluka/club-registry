import { useState, useEffect } from "react";
import { IpcRenderer } from "electron";
import { ErrorWrapper } from "../typings/tables";
import { useErrorSnackbar } from "./useErrorSnackbar";

const ipcRenderer: IpcRenderer = window.require("electron").ipcRenderer;

interface Options<T> {
  getData: () => ErrorWrapper<T>;
  ipcChannels: string[];
  defaultValue: T;
}

interface DataWithRefresher<T> {
  data: T;
  refresh: () => void;
}

export const getIpcUsingHook = <T>({
  getData,
  ipcChannels,
  defaultValue,
}: Options<T>) => {
  const useData = (): DataWithRefresher<T> => {
    const { enqueueErrorSnackbar } = useErrorSnackbar();

    const getDataWithErrorHandling = () => {
      const { payload, isError } = getData();

      if (isError) {
        enqueueErrorSnackbar({
          errorMessage:
            (payload as any)?.message ||
            String(payload) ||
            "Something went wrong",
        });
        return defaultValue;
      }

      return payload as T;
    };

    const [data, setData] = useState(getDataWithErrorHandling());

    const refresh = () => setData(getDataWithErrorHandling());

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
