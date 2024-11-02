import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Editor from "./pages/Editor";
import { Toaster, ToastOptions } from "react-hot-toast";

const App: React.FC = () => {
  return (
    <div className = "m-0 font-sans bg-[#1c1e29] antialiased">
      <div>
        <Toaster
          position="top-right"
          toastOptions={{
            success: {
              style: {
                background: "#4aed88",
              },
            },
          }}
        ></Toaster>
      </div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/editor/:roomId" element={<Editor />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
