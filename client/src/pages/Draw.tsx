// src/pages/Draw.tsx
import { useOutletContext } from "react-router-dom";
import DrawingCanvas from "../components/DrawingCanvas";
import { SocketContextType } from "../components/Layout";

export default function DrawPage() {
  const { sendMessage } = useOutletContext<SocketContextType>();
  console.log(sendMessage);
  return (
    <div className="flex flex-col w-full h-full bg-gray-100">
      <main className="flex-1 overflow-hidden">
        <DrawingCanvas sendMessage={sendMessage} />
      </main>
    </div>
  );
}
