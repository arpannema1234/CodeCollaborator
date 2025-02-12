import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
const Home:React.FC = () => {
  const [roomId, setRoomId] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const navigate = useNavigate();

  const createNewRoom = (e : React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const id = uuidv4();
    setRoomId(id);
    toast.success("Room Created Successfully 💕");
  };
  
  const joinHandler = (e: React.MouseEvent<Element> | React.KeyboardEvent<Element>) => {
    e.preventDefault();
    if (!roomId || !username) {
      toast.error("Enter Both the Fields 😣");
    } else {
      navigate(`/editor/${roomId}`, {
        state: {
          username,
        },
      });
    }
  };
  
  const handleInputEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      joinHandler(e); 
    }
  };
  
    

  return (
    <div className = "h-screen flex items-center justify-center text-white">
      <div className="bg-[#282a36] p-[20px] rounded-[10px] w-[450px] max-w-[90%]">
        <img className="h-[80px] mb-[30px]" src="/code-collaborator.png" alt="logo" />
        <h4 className="mb-[20px] mt-0 font-bold">Paste invitation ROOM ID</h4>
        <div className="flex flex-col">
          <input
            type="text"
            className="p-[10px] rounded-[5px] text-black border-0 outline-0 mb-[20px] bg-[#eee] text-[19px] font-bold"
            placeholder="ROOM ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            onKeyUp={handleInputEnter}
          />
          <input
            type="text"
            className="p-[10px] rounded-[5px] text-xl text-black border-0 outline-0 mb-[20px] bg-[#eee] text-[19px] font-bold"
            placeholder="USERNAME"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyUp={handleInputEnter}
          />
          <button onClick={joinHandler} className="hover:bg-[#2b824c] hover:transform hover:-translate-y-0.5 border-none p-[10px] rounded-[5px] text-[16px] cursor-pointer font-bold bg-[#4aed88] w-[100px] ml-auto transition-all duration-300 ease-in-out">
            Join Room
          </button>
          <span className="mt-2 mb-0 ml-auto mr-auto">
            If you don't have an invite then create
            <a onClick={createNewRoom} href="" className="ml-[5px] text-[#4aed88] no-underline border-b border-[#4aed88] transition-all duration-300 ease-in-out hover:text-[#2b824c] hover:border-[#2b824c] cursor-pointer">
              new room
            </a>
          </span>
        </div>
      </div>

      <footer className="fixed bottom-0">
        <h4>
          Built with ❤️ by &nbsp;
          <a className = "text-[#4aee88]" target = "_blank" rel = "noopener noreferrer" href="https://github.com/ManiacAyu">Ayush's Github</a>
        </h4>
      </footer>
    </div>
  );
};

export default Home;
