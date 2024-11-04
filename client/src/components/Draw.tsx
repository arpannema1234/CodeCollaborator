import React, { useRef, useEffect } from "react";
import { ACTIONS } from "../Actions";
import { Tldraw, TldrawEditor } from "tldraw";
import { useSyncDemo } from '@tldraw/sync';
import "tldraw/tldraw.css";
import { useParams } from "react-router-dom";
type RoomID = string;
const Draw: React.FC = () => {
  const { roomId } = useParams<{roomId : string}>();
  let RoomId = roomId;  

  const store = useSyncDemo({ roomId: `${roomId}` });
  console.log(`${roomId}`);
  return (
    <div className="ml-[250px]" style={{ position: "absolute", inset: 0 }}>
      <Tldraw store={store} />
    </div>
  );
};

export default Draw;
