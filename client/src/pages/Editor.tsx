import React, { useState, useRef, useEffect } from "react";
import Client from "../components/Client";
import EditorPage from "../components/EditorPage";
import { initSocket } from "../socket";
import { ACTIONS } from "../Actions";
import Draw from "../components/Draw";
import {
  useLocation,
  useParams,
  useNavigate,
  Navigate,
} from "react-router-dom";
import toast from "react-hot-toast";
import { Socket } from "socket.io-client";

interface ClientProps {
  socketId: string;
  username: string;
}

interface LocationState {
  username: string;
}

interface JoinPayload {
  clients: ClientProps[];
  username: string;
  socketId: string;
}

interface DisconnectPayload {
  socketId: string;
  username: string;
}

const Editor: React.FC = () => {
  const socketRef = useRef<Socket | null>(null);
  const codeRef = useRef<string | null>(null);
  const location = useLocation();
  const { roomId } = useParams<{ roomId: string }>();
  const [clients, setClients] = useState<ClientProps[]>([]);
  const reactNavigator = useNavigate();
  const [editor, setEditor] = useState<boolean>(true);

  const state = location.state as LocationState | null;

  const handleErrors = (err: Error) => {
    toast.error("Socket connection error, Try Later");
    reactNavigator("/");
  };

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      console.log(socketRef.current);

      socketRef.current.on("connect_error", handleErrors);
      socketRef.current.on("connect_failed", handleErrors);

      if (state?.username) {
        socketRef.current.emit(ACTIONS.JOIN, {
          roomId,
          username: state.username,
        });
      }

      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }: JoinPayload) => {
          if (username !== state?.username) {
            toast.success(`${username} joined the room`);
            console.log(`${username} joined the room`);
          }
          setClients(clients);
          socketRef.current?.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      socketRef.current.on(
        ACTIONS.DISCONNECTED,
        ({ socketId, username }: DisconnectPayload) => {
          toast.success(`${username} has left the room`);
          setClients((prev) =>
            prev.filter((client) => client.socketId !== socketId)
          );
        }
      );
    };

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
      }
    };
  }, [state, roomId]);

  const copyRoomId = async () => {
    try {
      if (roomId) {
        await navigator.clipboard.writeText(roomId);
        toast.success("Room ID has been copied to clipboard");
      }
    } catch (err) {
      toast.error("Failed to copy room ID");
    }
  };

  const leaveRoom = () => {
    reactNavigator("/");
  };

  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="EditorPageLogo">
            <img className="logoImg" src="/code-collaborator.png" alt="logo" />
          </div>
          <h3>Connected</h3>
          <div className="clientsList">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>
        <div className="flex justify-between font-bold ">
          <span onClick={() => setEditor(true)} className="ml-3 p-3 bg-[#4aee] rounded-lg cursor-pointer">Code</span>
          <span onClick={ () => setEditor(false)} className="mr-3 p-3 bg-[#4aee] rounded-lg cursor-pointer">Draw</span>
        </div>
        <button
          className="mt-[20px] w-[100%] hover:bg-[#edac4a] hover:transform hover:-translate-y-0.5 border-none p-[10px] rounded-[5px] text-[16px] cursor-pointer font-bold bg-[#edbf4a] transition-all duration-300 ease-in-out"
          onClick={copyRoomId}
        >
          Copy ROOM ID
        </button>
        <button className="btn leaveBtn" onClick={leaveRoom}>
          LEAVE
        </button>
      </div>
      <div className="editorWrap">
        {editor && (
          <EditorPage
            socketRef={socketRef}
            roomId={roomId || ""}
            onCodeChange={(code: string) => {
              codeRef.current = code;
            }}
            editor={editor}
          />
        )}
        {!editor && (
          <Draw/>
        )}
      </div>
    </div>
  );
};

export default Editor;
