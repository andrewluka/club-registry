import { useState, useEffect } from "react";
import { getAllGames } from "../services/tablesServices";

const { ipcRenderer } = window.require("electron");

export const useGames = () => {
  const [games, setGames] = useState(getAllGames());

  useEffect(() => {
    const channel = "games_changed";
    const listener = () => {
      setGames(getAllGames());
    };

    ipcRenderer.on(channel, listener);

    return () => ipcRenderer.removeListener(channel, listener);
  }, []);

  return games;
};
