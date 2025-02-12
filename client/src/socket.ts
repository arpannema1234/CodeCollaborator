export const initSocket = (roomId: string): WebSocket => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || "127.0.0.1:8000";
    const wsUrl = `ws://${backendUrl}/ws/quiz/${roomId}/`;
    console.log(process.env.REACT_APP_BACKEND_URL);


    console.log(`🟢 WebSocket attempting connection to: ${wsUrl}`);

    const socket = new WebSocket(wsUrl);
    console.log(socket);

    socket.onopen = () => console.log("✅ WebSocket Connected!");
    socket.onerror = (err) => console.error("❌ WebSocket Error:", err);
    socket.onclose = (err) => console.warn("🔴 WebSocket Disconnected:", err);

    return socket;
};
