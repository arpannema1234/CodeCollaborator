import React, { useRef, useEffect } from "react";
import CodeMirror, { Editor } from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/edit/closetag";
import { ACTIONS } from "../Actions";

interface EditorPageProps {
  socketRef: React.RefObject<WebSocket>;
  roomId: string;
  onCodeChange: (code: string) => void;
  latestCode: string;
}

interface CodeChangePayload {
  action: string;
  code: string;
}

const EditorPage: React.FC<EditorPageProps> = ({ socketRef, roomId, onCodeChange, latestCode }) => {
  const editorRef = useRef<Editor | null>(null);

  useEffect(() => {
    function initEditor() {
      if (editorRef.current) return;

      const textarea = document.getElementById("realtimeEditor") as HTMLTextAreaElement | null;
      if (!textarea) return;

      editorRef.current = CodeMirror.fromTextArea(textarea, {
        mode: { name: "javascript", json: true },
        theme: "dracula",
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
      });

      editorRef.current.setValue(latestCode || "");

      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const newCode = instance.getValue();

        if (origin !== "setValue") {
          onCodeChange(newCode);

          if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(
              JSON.stringify({
                action: ACTIONS.CODE_CHANGE,
                roomId,
                code: newCode,
              })
            );
          }
        }
      });
    }

    initEditor();
  }, []);

  useEffect(() => {
    if (editorRef.current && latestCode !== editorRef.current.getValue()) {
      editorRef.current.setValue(latestCode);
    }
  }, [latestCode]);

  return <textarea id="realtimeEditor"></textarea>;
};

export default EditorPage;
