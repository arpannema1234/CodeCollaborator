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

// ✅ Define Types
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
  const socketRef = useRef<WebSocket | null>(null); // ✅ Explicitly define WebSocket type
  const codeRef = useRef<string>(""); // ✅ Store latest code
  const location = useLocation();
  const { roomId } = useParams<{ roomId: string }>();
  const [clients, setClients] = useState<ClientProps[]>([]);
  const [code, setCode] = useState<string>(""); // ✅ Track editor updates
  const reactNavigator = useNavigate();
  const [editor, setEditor] = useState<boolean>(true);
  const state = location.state as LocationState | null;

  useEffect(() => {
    if (!roomId) return;

    // ✅ Initialize WebSocket Connection
    const socket = initSocket(roomId);
    socketRef.current = socket;

    socket.onopen = () => {
      if (state?.username) {
        socket.send(
          JSON.stringify({
            action: ACTIONS.JOIN,
            roomId,
            username: state.username,
          })
        );
      }
    };

    socket.onclose = () => {
      console.log("🔴 Disconnected from WebSocket");
    };

    return () => {
      socket.close();
    };
  }, [state, roomId, socketRef]);

  // ✅ Handle Switching Between Code & Draw Without Losing Code State
  useEffect(() => {
    if (!editor || !socketRef.current) return;

    socketRef.current.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      console.log(data);
      if(!socketRef.current) return;
      switch (data.action) {
        case ACTIONS.JOINED:
          console.log("✅ ACTIONS.JOINED Triggered");
          if (data.username !== state?.username) {
            toast.success(`${data.username} joined the room`);
          }
          setClients(data.clients);

          socketRef.current.send(
            JSON.stringify({
              action: ACTIONS.SYNC_CODE,
              code: codeRef.current,
              socketId: data.socketId,
            })
          );
          break;

        case ACTIONS.DISCONNECTED:
          toast.success(`${data.username} has left the room`);
          setClients((prev) =>
            prev.filter((client) => client.socketId !== data.socketId)
          );
          break;

        case ACTIONS.CODE_CHANGE:
          setCode(data.code);
          codeRef.current = data.code;
          break;
      }
    };
  }, []);

  const copyRoomId = async () => {
    try {
      if (roomId) {
        await navigator.clipboard.writeText(roomId);
        toast.success("📋 Room ID copied!");
      }
    } catch (err) {
      toast.error("❌ Failed to copy Room ID");
    }
  };

  const leaveRoom = () => {
    reactNavigator("/");
  };

  if (!location.state) {
    return <Navigate to="/" />;
  }
  console.log(clients);
  return (
    <div className="flex max-h-full bg-[#1e1e2e] text-white">
      <div className="w-1/4 bg-gray-900 p-5 flex flex-col justify-between">
        <div>
          <div className="flex justify-center mb-5">
            <img className="w-32" src="/code-collaborator.png" alt="logo" />
          </div>
          <h3 className="text-xl font-bold text-center">Connected Users</h3>
          <div className="clientsList">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <button
              onClick={() => setEditor(true)}
              className={`p-3 mr-3 w-1/2 text-center rounded-lg cursor-pointer font-bold transition-all ${
                editor ? "bg-blue-500 text-white" : "bg-gray-700"
              }`}
            >
              Code
            </button>
            <button
              onClick={() => setEditor(false)}
              className={`p-3 w-1/2 text-center rounded-lg cursor-pointer font-bold transition-all ${
                !editor ? "bg-blue-500 text-white" : "bg-gray-700"
              }`}
            >
              Draw
            </button>
          </div>
          <button
            className="w-full p-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition-all"
            onClick={copyRoomId}
          >
            Copy Room ID
          </button>
          <button
            className="w-full p-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all"
            onClick={leaveRoom}
          >
            Leave Room
          </button>
        </div>
      </div>

      <div className="flex-1 bg-gray-800 p-5">
        {editor ? (
          <EditorPage
            socketRef={socketRef}
            roomId={roomId || ""}
            onCodeChange={(newCode) => {
              setCode(newCode);
              codeRef.current = newCode;
            }}
            latestCode={code}
          />
        ) : (
          <Draw />
        )}
      </div>
    </div>
  );
};

export default Editor;
