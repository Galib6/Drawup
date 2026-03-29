import { useCallback, useState } from "react";
import { socket } from "../api/socket";
import { DrawElement } from "../types";

type SetStateAction = DrawElement[] | ((prev: DrawElement[]) => DrawElement[]) | "prevState";

export default function useHistory(
  initialState: DrawElement[],
  session: string | null
): [
  DrawElement[],
  (action: SetStateAction, overwrite?: boolean, emit?: boolean) => void,
  () => void,
  () => void,
  boolean
] {
  const [history, setHistory] = useState<DrawElement[][]>([initialState]);
  const [index, setIndex] = useState<number>(0);

  const setState = useCallback(
    (action: SetStateAction, overwrite = false, emit = true): void => {
      const newState: DrawElement[] =
        typeof action === "function" ? action(history[index]) : action === "prevState" ? history[index] : action;

      if (session) {
        if (action === "prevState") return;
        setHistory([newState]);
        setIndex(0);

        if (emit) {
          socket.emit("getElements", { elements: newState, roomId: session });
        }
        return;
      }

      if (action === "prevState") {
        const updatedState = [...history].slice(0, index + 1);
        setHistory([...updatedState, history[index - 1]]);
        setIndex((prevState) => prevState - 1);
        return;
      }

      if (overwrite) {
        const historyCopy = [...history];
        historyCopy[index] = newState;
        setHistory(historyCopy);
      } else {
        const updatedState = [...history].slice(0, index + 1);
        setHistory([...updatedState, newState]);
        setIndex((prevState) => prevState + 1);
      }
    },
    [history, index, session]
  );

  const undo = useCallback((): void => {
    setIndex((prevState) => (prevState > 0 ? prevState - 1 : prevState));
  }, []);

  const redo = useCallback((): void => {
    setIndex((prevState) =>
      prevState < history.length - 1 ? prevState + 1 : prevState
    );
  }, [history.length]);

  const canUndo = index > 0;

  return [history[index], setState, undo, redo, canUndo];
}
