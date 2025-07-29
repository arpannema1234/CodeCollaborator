import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { EditorState, Compartment } from "@codemirror/state";
import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { oneDark } from "@codemirror/theme-one-dark";
import throttle from "lodash.throttle";
import { SocketContextType } from "../components/Layout";

const Editor = () => {
  const { sendMessage } = useOutletContext<SocketContextType>();
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const suppressRef = useRef(false); // to prevent echo

  const [fontSize, setFontSize] = useState(14);
  const [language, setLanguage] = useState("javascript");

  const languageCompartment = useRef(new Compartment()).current;
  const fontSizeCompartment = useRef(new Compartment()).current;

  const throttledSend = useRef(
    throttle((content: string) => {
      console.log("📤 Sending code update:", content.length, "characters");
      sendMessage({
        action: "code-change",
        code: content,
      });
    }, 300) // Increased throttle for better performance
  ).current;

  useEffect(() => {
    // Setup CodeMirror editor
    if (editorRef.current && !viewRef.current) {
      const state = EditorState.create({
        doc: "",
        extensions: [
          basicSetup,
          oneDark,
          languageCompartment.of(javascript()),
          fontSizeCompartment.of(
            EditorView.theme({ "&": { fontSize: `${fontSize}px` } })
          ),
          EditorView.updateListener.of((update) => {
            if (update.docChanged && !suppressRef.current) {
              const content = update.state.doc.toString();
              throttledSend(content);
            }
          }),
        ],
      });

      viewRef.current = new EditorView({
        state,
        parent: editorRef.current,
      });

      // Request current state from the backend when editor mounts
      console.log("Requesting current code state...");
      sendMessage({
        action: "request_state",
      });
    }

    // Listen for WebSocket messages from Layout
    const handleWebSocketMessage = (event: any) => {
      const data = event.detail;
      console.log("📥 Editor received WebSocket message:", data);

      if (data.action === "code-change" && viewRef.current) {
        const current = viewRef.current.state.doc.toString();
        if (data.code !== current) {
          console.log("🔄 Applying code change from remote");
          suppressRef.current = true;
          viewRef.current.dispatch({
            changes: { from: 0, to: current.length, insert: data.code },
          });
          suppressRef.current = false;
        }
      } else if (data.action === "joined") {
        console.log("👥 Users in room:", data.clients);
      }
    };

    window.addEventListener("websocket-message", handleWebSocketMessage);

    return () => {
      window.removeEventListener("websocket-message", handleWebSocketMessage);
    };
  }, [fontSizeCompartment, languageCompartment, throttledSend, sendMessage]);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    const extension =
      lang === "python" ? python() : lang === "java" ? java() : javascript();

    viewRef.current?.dispatch({
      effects: languageCompartment.reconfigure(extension),
    });
  };

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
    viewRef.current?.dispatch({
      effects: fontSizeCompartment.reconfigure(
        EditorView.theme({ "&": { fontSize: `${size}px` } })
      ),
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Editor controls */}
      <div className="flex gap-3 items-center p-4 bg-[#2D2D2D] border-b border-gray-600">
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="border rounded px-3 py-1 bg-[#333333] text-white"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
        </select>
        <select
          value={fontSize}
          onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
          className="border rounded px-3 py-1 bg-[#333333] text-white"
        >
          {[12, 14, 16, 18, 20].map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </select>
      </div>

      {/* Code editor */}
      <div
        ref={editorRef}
        className="bg-[#1E1E1E] text-white rounded-md shadow-lg flex-1 overflow-auto"
      />
    </div>
  );
};

export default Editor;
