export const initSocket = (roomId: string): WebSocket => {
    const backendUrl = "https://codecollaborator.onrender.com"

    // Automatically switch between ws:// and wss://
    const wsProtocol = backendUrl.startsWith("https") ? "wss" : "ws";
    const wsUrl = `${wsProtocol}://${new URL(backendUrl).host}/ws/quiz/${roomId}/`;

    console.log(`🟢 WebSocket attempting connection to: ${wsUrl}`);

    const socket = new WebSocket(wsUrl);

    socket.onopen = () => console.log("✅ WebSocket Connected!");
    socket.onerror = (err) => console.error("❌ WebSocket Error:", err);
    socket.onclose = (err) => console.warn("🔴 WebSocket Disconnected:", err);

    return socket;
};
