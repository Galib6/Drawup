import { useEffect } from "react";
import { socket } from "../api/socket";
import Canvas from "../components/Canvas";
import Ui from "../components/Ui";
import { useAppContext } from "../provider/AppStates";

export default function WorkSpace(): JSX.Element {
  const { setSession, elements, setElements } = useAppContext();

  useEffect(() => {
    window.addEventListener("beforeunload", () => {
      socket.emit("leave");
    });
  }, []);

  // useEffect(() => {
  //   const room = searchParams.get("room");

  //   if (room) {
  //     setSession(room);
  //     socket.emit("join", {room, elements});

  //     socket.on("initElements", (data) => {
  //       setElements(data, true, false);
  //     });
  //   }
  // }, [searchParams]);

  return (
    <>
      <Ui />
      <Canvas />
    </>
  );
}
