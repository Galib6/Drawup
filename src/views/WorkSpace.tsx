import { useCanvas as useRemoteCanvasQuery } from "@/@api/canvas/hooks";
import { useAuthSession } from "@components/auth/lib/utils";
import { useEffect, useRef, useState } from "react";
import { socket } from "../api/socket";
import Canvas from "../components/Canvas";
import Ui from "../components/Ui";
import { useCloudSyncContext } from "../provider/CloudSyncContext";
import { useAppContext } from "../provider/AppStates";
import type { DrawElement } from "../types";

export default function WorkSpace(): JSX.Element {
  const { isAuthenticate: isLoggedIn } = useAuthSession();
  const { activeArchiveDiagram, setElements, elements } = useAppContext();
  const { setSyncBaseline } = useCloudSyncContext();

  const needsRemote = Boolean(isLoggedIn && activeArchiveDiagram?.designId);
  const designId = activeArchiveDiagram?.designId ?? "";

  const remote = useRemoteCanvasQuery({
    id: designId,
    // queryKey is supplied inside @/@api/canvas useCanvas
    config: { enabled: needsRemote } as never,
  });

  const elementsRef = useRef(elements);
  elementsRef.current = elements;

  const hydratedDesignRef = useRef<string | null>(null);

  const [bootstrapped, setBootstrapped] = useState(() => !needsRemote);

  useEffect(() => {
    if (!needsRemote) {
      setBootstrapped(true);
    } else {
      setBootstrapped(false);
    }
  }, [needsRemote, activeArchiveDiagram?.designId]);

  useEffect(() => {
    hydratedDesignRef.current = null;
  }, [activeArchiveDiagram?.designId]);

  useEffect(() => {
    if (!needsRemote || !remote.isError) return;
    setSyncBaseline(elementsRef.current);
    setBootstrapped(true);
  }, [needsRemote, remote.isError, setSyncBaseline]);

  useEffect(() => {
    if (!needsRemote) return;
    if (!remote.isSuccess || !remote.data?.data || !activeArchiveDiagram) return;
    if (hydratedDesignRef.current === activeArchiveDiagram.designId) return;

    const serverElements = (remote.data.data.canvasData ?? []) as DrawElement[];
    const serverJson = JSON.stringify(serverElements);
    const localJson = JSON.stringify(elementsRef.current);

    if (serverJson !== localJson) {
      setElements(JSON.parse(serverJson) as DrawElement[], true, false);
    }
    setSyncBaseline(JSON.parse(serverJson) as DrawElement[]);
    hydratedDesignRef.current = activeArchiveDiagram.designId;
    setBootstrapped(true);
  }, [
    needsRemote,
    remote.isSuccess,
    remote.data,
    activeArchiveDiagram,
    setElements,
    setSyncBaseline,
  ]);

  useEffect(() => {
    window.addEventListener("beforeunload", () => {
      socket.emit("leave");
    });
  }, []);

  const showLoadingCanvas = needsRemote && !bootstrapped;

  return (
    <>
      {showLoadingCanvas && (
        <div
          className="canvasCloudOverlay"
          role="status"
          aria-live="polite"
          aria-busy={showLoadingCanvas}
        >
          <div className="canvasCloudOverlayInner">Loading latest canvas…</div>
        </div>
      )}
      <Ui />
      <Canvas />
    </>
  );
}
