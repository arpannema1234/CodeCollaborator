import { useEffect, useRef } from "react";
import { Tldraw, Editor } from "tldraw";
import "tldraw/tldraw.css";

type Props = {
  sendMessage: (message: any) => void;
};

export default function DrawingCanvas({ sendMessage }: Props) {
  const editorRef = useRef<Editor | null>(null);
  const suppressUpdateRef = useRef(false);
  const lastSnapshotRef = useRef<string | null>(null);
  const hasReceivedInitialStateRef = useRef(false);

  useEffect(() => {
    // Listen for WebSocket messages from Layout
    const handleWebSocketMessage = (event: any) => {
      const data = event.detail;
      console.log("Drawing received WebSocket message:", data);

      if (data.action === "draw_update" || data.action === "drawing_update") {
        try {
          const payload = data.payload;
          const editor = editorRef.current;
          if (editor && payload && !suppressUpdateRef.current) {
            console.log("Applying drawing update to canvas");
            suppressUpdateRef.current = true;

            // Update our last snapshot to prevent echo
            lastSnapshotRef.current = JSON.stringify(payload);

            editor.store.loadStoreSnapshot(payload);
            suppressUpdateRef.current = false;

            // Mark that we've received initial state
            hasReceivedInitialStateRef.current = true;
          }
        } catch (e) {
          console.error("Error applying drawing update", e);
          suppressUpdateRef.current = false;
        }
      }
    };

    window.addEventListener("websocket-message", handleWebSocketMessage);

    return () => {
      window.removeEventListener("websocket-message", handleWebSocketMessage);
    };
  }, []);

  const handleMount = (editor: Editor) => {
    console.log("Drawing canvas mounted");
    editorRef.current = editor;

    // Request current state from the backend when component mounts
    console.log("Requesting current drawing state...");
    sendMessage({
      action: "request_state",
    });

    // Add a small delay to allow initial state to be received before starting to listen
    setTimeout(() => {
      // If no initial state was received after timeout, mark as ready
      if (!hasReceivedInitialStateRef.current) {
        console.log(
          "No initial drawing state received, starting with empty canvas"
        );
        hasReceivedInitialStateRef.current = true;
      }
    }, 1000);

    // Listen to store changes for real-time sync
    const unsubscribe = editor.store.listen(() => {
      // Don't send updates if we're suppressing or haven't received initial state yet
      if (suppressUpdateRef.current || !hasReceivedInitialStateRef.current)
        return;

      try {
        const snapshot = editor.store.getStoreSnapshot();
        const snapshotString = JSON.stringify(snapshot);

        // Only send if the snapshot has actually changed
        if (lastSnapshotRef.current !== snapshotString) {
          lastSnapshotRef.current = snapshotString;
          console.log("Sending drawing update - content changed");
          sendMessage({
            action: "drawing_update",
            payload: snapshot,
          });
        }
      } catch (e) {
        console.error("Error getting store snapshot:", e);
      }
    });

    // Clean up listener when component unmounts
    return () => {
      unsubscribe();
    };
  };

  return (
    <div className="absolute inset-0">
      <Tldraw onMount={handleMount} />
    </div>
  );
}
