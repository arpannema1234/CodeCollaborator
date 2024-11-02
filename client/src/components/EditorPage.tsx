import React, { useRef, useEffect } from "react";
import CodeMirror, { Editor } from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/edit/closetag";
import { ACTIONS } from "../Actions"; 

interface EditorPageProps {
  socketRef: React.RefObject<any>; 
  roomId: string;
  onCodeChange: (code: string) => void;
}

interface CodeChangePayload {
  code: string; 
}

const EditorPage: React.FC<EditorPageProps> = ({ socketRef, roomId, onCodeChange } : EditorPageProps) => {
  const editorRef = useRef<Editor | null>(null);

  useEffect(() => {
    async function init() {
      if (editorRef.current) return;

      editorRef.current = CodeMirror.fromTextArea(
        document.getElementById('realtimeEditor') as HTMLTextAreaElement,
        {
          mode: { name: 'javascript', json: true },
          theme: 'dracula',
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
        }
      );

      editorRef.current.on('change', (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== 'setValue') {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
      });
    }

    init();
  }, [onCodeChange, roomId, socketRef]);

  useEffect(() => {
    console.log(socketRef.current);
    if (socketRef.current) {
      
      socketRef.current.on(ACTIONS.CODE_CHANGE, (payload: CodeChangePayload) => { 
        const { code } = payload; 
        if (code !== null && editorRef.current) {
          editorRef.current.setValue(code);
        }
      });
    }

    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef.current]);

  return <textarea id="realtimeEditor"></textarea>;
};

export default EditorPage;
