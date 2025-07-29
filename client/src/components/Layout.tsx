import { useEffect, useRef, useState } from "react";
import { useParams, Outlet, useNavigate } from "react-router-dom";

export interface SocketContextType {
  socket: WebSocket | null;
  connectionStatus: "connecting" | "connected" | "disconnected" | "error";
  sendMessage: (message: any) => void;
}

const Layout = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef<WebSocket | null>(null);

  const [username, setUsername] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("connecting");

  useEffect(() => {
    const name = localStorage.getItem("username");
    if (!name) {
      alert("Username missing. Redirecting to home.");
      navigate("/");
      return;
    }
    setUsername(name);

    // Only create connection if it doesn't exist
    if (
      !socketRef.current ||
      socketRef.current.readyState === WebSocket.CLOSED
    ) {
      console.log("🔌 Creating new WebSocket connection");
      // Setup WebSocket connection
      const wsBaseUrl =
        import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8000";
      const socket = new WebSocket(`${wsBaseUrl}/ws/editor/${roomId}/`);
      socketRef.current = socket;

      // Handle successful connection
      socket.onopen = () => {
        console.log("✅ WebSocket connection established!");
        setConnectionStatus("connected");
        // Send join message to the room
        socket.send(
          JSON.stringify({
            action: "join",
            username: name,
          })
        );
      };

      // Handle connection errors
      socket.onerror = (error) => {
        console.error("❌ WebSocket connection error:", error);
        setConnectionStatus("error");
        alert(
          "Failed to connect to the server. Please check if the server is running."
        );
      };

      // Handle connection closing
      socket.onclose = (event) => {
        console.log(
          "🔌 WebSocket connection closed:",
          event.code,
          event.reason
        );
        setConnectionStatus("disconnected");
        if (event.code !== 1000) {
          // 1000 is normal closure
          alert("Connection lost. Please refresh the page.");
        }
      };

      // Handle incoming messages
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("📥 Layout received WebSocket message:", data);

        // Dispatch custom event for child components to listen to
        window.dispatchEvent(
          new CustomEvent("websocket-message", { detail: data })
        );
      };
    }

    return () => {
      // Only close connection when component actually unmounts (not on route change)
      // We'll handle this in a cleanup effect instead
    };
  }, [roomId]); // Only depend on roomId, not navigate

  // Separate cleanup effect for when component truly unmounts
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        console.log("🔌 Closing WebSocket connection on unmount");
        socketRef.current.close();
      }
    };
  }, []);

  const sendMessage = (message: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log("📤 Layout sending message:", message);
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected, cannot send message:", message);
    }
  };

  const socketContext: SocketContextType = {
    socket: socketRef.current,
    connectionStatus,
    sendMessage,
  };

  return (
    <div className="flex flex-col gap-0 h-screen bg-blue-400">
      {/* Header with room info and connection status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-[#1E1E1E]">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          🏷 Room ID: <span className="text-blue-500">{roomId}</span> | 👤{" "}
          {username}
          <span
            className={`ml-2 px-2 py-1 rounded text-xs ${
              connectionStatus === "connected"
                ? "bg-green-600 text-white"
                : connectionStatus === "connecting"
                ? "bg-yellow-600 text-white"
                : connectionStatus === "error"
                ? "bg-red-600 text-white"
                : "bg-gray-600 text-white"
            }`}
          >
            {connectionStatus === "connected"
              ? "🟢 Connected"
              : connectionStatus === "connecting"
              ? "🟡 Connecting..."
              : connectionStatus === "error"
              ? "🔴 Error"
              : "🔴 Disconnected"}
          </span>
        </h2>
        <div className="flex gap-3 items-center">
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            onClick={() => navigate(`/${roomId}/editor`)}
          >
            💻 Editor
          </button>
          <button
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            onClick={() => navigate(`/${roomId}/draw`)}
          >
            ✏️ Draw
          </button>
          <button
            className="bg-gray-100 text-black px-3 py-1 rounded hover:bg-gray-200"
            onClick={() => navigate("/")}
          >
            ⬅️ Home
          </button>
        </div>
      </div>

      {/* Child components will be rendered here */}
      <div className="flex-1 overflow-hidden">
        <Outlet context={socketContext} />
      </div>
    </div>
  );
};

export default Layout;
