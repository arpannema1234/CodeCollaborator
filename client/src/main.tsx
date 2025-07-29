import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Editor from "./pages/Editor.tsx";
import Draw from "./pages/Draw.tsx";
import Layout from "./components/Layout.tsx";
import "./main.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/:roomId" element={<Layout />}>
        <Route path="editor" element={<Editor />} />
        <Route path="draw" element={<Draw />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
