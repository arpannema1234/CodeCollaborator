export const initSocket = (roomId: string): WebSocket => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";

    // Convert backend URL to WebSocket protocol
    const wsProtocol = backendUrl.startsWith("https") ? "wss" : "ws";
    const wsUrl = `${wsProtocol}://${new URL(backendUrl).host}/ws/quiz/${roomId}/`;

    console.log(`🟢 WebSocket attempting connection to: ${wsUrl}`);

    const socket = new WebSocket(wsUrl);

    socket.onopen = () => console.log("✅ WebSocket Connected!");
    socket.onerror = (err) => console.error("❌ WebSocket Error:", err);
    socket.onclose = (err) => console.warn("🔴 WebSocket Disconnected:", err);

    return socket;
};
