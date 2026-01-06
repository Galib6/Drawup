import { motion } from "framer-motion";
import { ReactNode, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { v4 as uuid } from "uuid";
import { socket } from "../api/socket";
import { Xmark } from "../assets/icons";
import { useAppContext } from "../provider/AppStates";

export default function Collaboration(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const { session, setSession } = useAppContext();
  const [open, setOpen] = useState<boolean>(false);
  const users = 0;

  const startSession = (): void => {
    const sessionId = uuid();
    setSearchParams({ room: sessionId });
    setSession(sessionId);
  };

  const endSession = (): void => {
    searchParams.delete("room");
    socket.emit("leave", session);
    setSession(null);
    setOpen(false);
    window.history.replaceState(null, "", "/");
  };

  return (
    <div className="collaboration">
      <button
        data-users={users > 99 ? "99+" : users}
        type="button"
        className={
          "sectionStyle collaborateButton" + `${session ? " active" : ""}`
        }
        onClick={() => setOpen(true)}
      >
        {`Share${session ? "d" : ""}`}
      </button>

      {open && (
        <CollabBox collabState={[open, setOpen]}>
          {session ? (
            <SessionInfo endSession={endSession} />
          ) : (
            <CreateSession startSession={startSession} />
          )}
        </CollabBox>
      )}
    </div>
  );
}

interface CreateSessionProps {
  startSession: () => void;
}

function CreateSession({ startSession }: CreateSessionProps): JSX.Element {
  return (
    <div className="collabCreate">
      <h2>Live collaboration</h2>
      <div>
        <p>Invite people to collaborate on your drawing.</p>
        <p>
          Don't worry, the session is end-to-end encrypted, and fully private.
          Not even our server can see what you draw.
        </p>
      </div>
      <button onClick={startSession}>Start session</button>
    </div>
  );
}

interface SessionInfoProps {
  endSession: () => void;
}

function SessionInfo({ endSession }: SessionInfoProps): JSX.Element {
  const copy = (): void => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="collabInfo">
      <h2>Live collaboration</h2>

      <div className="collabGroup">
        <label htmlFor="collabUrl">Link</label>
        <div className="collabLink">
          <input
            id="collabUrl"
            type="url"
            value={window.location.href}
            disabled
          />
          <button type="button" onClick={copy}>
            Copy link
          </button>
        </div>
      </div>
      <div className="endCollab">
        <button type="button" onClick={endSession}>
          Stop session
        </button>
      </div>
    </div>
  );
}

interface CollabBoxProps {
  collabState: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  children: ReactNode;
}

function CollabBox({ collabState, children }: CollabBoxProps): JSX.Element {
  const [, setOpen] = collabState;
  const exit = (): void => setOpen(false);

  return (
    <div className="collaborationContainer">
      <motion.div
        className="collaborationBoxBack"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        onClick={exit}
      ></motion.div>
      <motion.section
        initial={{ scale: 0.7 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.15 }}
        className="collaborationBox"
      >
        <button onClick={exit} type="button" className="closeCollbBox">
          <Xmark />
        </button>

        {children}
      </motion.section>
    </div>
  );
}
