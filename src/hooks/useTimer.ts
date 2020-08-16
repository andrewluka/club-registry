import { useState, useEffect } from "react";

export const useTimer = (startTime: number) => {
  let [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setTimeElapsed(Date.now() - startTime),
      1000
    );

    return () => clearInterval(interval);
  }, []);

  return { timeElapsed };
};
