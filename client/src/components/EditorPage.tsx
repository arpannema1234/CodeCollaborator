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

const EditorPage: React.FC<EditorPageProps> = ({
  socketRef,
  roomId,
  onCodeChange,
  latestCode,
}) => {
  const editorRef = useRef<Editor | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!textareaRef.current || editorRef.current) return;

    editorRef.current = CodeMirror.fromTextArea(textareaRef.current, {
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

    return () => {
      if (editorRef.current) {
        try {
          editorRef.current.toTextArea();
        } catch (error) {
          console.warn("CodeMirror cleanup error:", error);
        }
        editorRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && latestCode !== editorRef.current.getValue()) {
      editorRef.current.setValue(latestCode);
    }
  }, [latestCode]);

  return <textarea ref={textareaRef} id="realtimeEditor"></textarea>;
};

export default EditorPage;
