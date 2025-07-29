import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer

class Consumer(AsyncWebsocketConsumer):
    user_room_map = {}  # ✅ Dictionary to store users per room
    room_state = {}  # ✅ Dictionary to store room state (code and drawing data)

    async def connect(self):
        """Handle new WebSocket connection."""
        try:
            print(f"WebSocket connection attempt: {self.scope['url_route']}")
            self.channel_layer = get_channel_layer()
            self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
            self.room_group_name = f"room_{self.room_name}"
            
            print(f"Channel name: {self.channel_name}")
            print(f"Room name: {self.room_name}")
            
            # Add socket to room group
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()
            
            print(f"✅ WebSocket connected successfully for room: {self.room_name}")
            
        except Exception as e:
            print(f"❌ WebSocket connection error: {e}")
            await self.close()
  

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        try:
            print(f"WebSocket disconnecting with code: {close_code}")
            
            if hasattr(self, 'room_name') and self.room_name in self.user_room_map:
                # Remove user from room
                self.user_room_map[self.room_name].pop(self.channel_name, None)
                
                # Notify others in the room
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "user_disconnected",
                        "socket_id": self.channel_name,
                    },
                )
                
                # If the room is empty, remove it and its state
                if not self.user_room_map[self.room_name]:
                    del self.user_room_map[self.room_name]
                    if self.room_name in self.room_state:
                        del self.room_state[self.room_name]
                    print(f"Room {self.room_name} removed (empty) with its state")

            if hasattr(self, 'room_group_name'):
                await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
                print(f"✅ WebSocket disconnected from room: {getattr(self, 'room_name', 'unknown')}")
                
        except Exception as e:
            print(f"❌ Error during disconnect: {e}")
    

    async def receive(self, text_data):
      
        try:
            data = json.loads(text_data)
           

            action = data.get("action")

            if action == "join":
                username = data.get("username", "Anonymous")

                # ✅ Ensure the room exists in the map
                if self.room_name not in self.user_room_map:
                    self.user_room_map[self.room_name] = {}
                
                # ✅ Initialize room state if it doesn't exist
                if self.room_name not in self.room_state:
                    self.room_state[self.room_name] = {
                        "code": "",
                        "drawing": None
                    }

                # ✅ Add user to the correct room
                self.user_room_map[self.room_name][self.channel_name] = username

                # ✅ Get the correct users for the room
                clients = [
                    {"socketId": sid, "username": name}
                    for sid, name in self.user_room_map[self.room_name].items()
                ]
         
                # Send current state to the new user first
                current_state = self.room_state[self.room_name]
                
                # Send current code if exists
                if current_state["code"]:
                    await self.send(text_data=json.dumps({
                        "action": "code-change",
                        "code": current_state["code"]
                    }))
                
                # Send current drawing if exists
                if current_state["drawing"]:
                    await self.send(text_data=json.dumps({
                        "action": "drawing_update",
                        "payload": current_state["drawing"]
                    }))

                # Notify all users in the room about the new user
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "user_joined",
                        "clients": clients,
                        "username": username,
                        "socket_id": self.channel_name,
                    },
                )

            elif action == "code-change":
                code = data.get("code", "")
                
                # Store the current code state
                if self.room_name not in self.room_state:
                    self.room_state[self.room_name] = {"code": "", "drawing": None}
                self.room_state[self.room_name]["code"] = code

                # Broadcast code change to all users in the room
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {"type": "broadcast_code", "code": code},
                )

            elif action == "drawing_update":
                payload = data.get("payload")
                print(f"🎨 Drawing update received for room {self.room_name}")
                
                # Store the current drawing state
                if self.room_name not in self.room_state:
                    self.room_state[self.room_name] = {"code": "", "drawing": None}
                self.room_state[self.room_name]["drawing"] = payload

                # Broadcast drawing update to all users in the room
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "broadcast_drawing",
                        "payload": payload,
                        "sender_id": self.channel_name,
                    },
                )

            elif action == "request_state":
                # Send the current state to the requesting user
                if self.room_name in self.room_state:
                    current_state = self.room_state[self.room_name]
                    
                    # Send current code if exists
                    if current_state["code"]:
                        await self.send(text_data=json.dumps({
                            "action": "code-change",
                            "code": current_state["code"]
                        }))
                    
                    # Send current drawing if exists
                    if current_state["drawing"]:
                        await self.send(text_data=json.dumps({
                            "action": "drawing_update",
                            "payload": current_state["drawing"]
                        }))
                    
                    print(f"📤 Sent current state to user in room {self.room_name}")

        except json.JSONDecodeError:
            print("❌ ERROR: Received invalid JSON!")
        except Exception as e:
            print(f"❌ Unexpected Error: {e}")

    async def user_joined(self, event):
        await self.send(text_data=json.dumps({
            "action": "joined",
            "clients": event["clients"],  
            "username": event["username"],  
            "socket_id": event["socket_id"],  
        }))

    async def user_disconnected(self, event):
        await self.send(text_data=json.dumps({"action": "disconnected", **event}))

    async def broadcast_code(self, event):
        await self.send(text_data=json.dumps({"action": "code-change", "code": event["code"]}))

    async def broadcast_drawing(self, event):
        # Don't send drawing updates back to the sender to prevent infinite loops
        if event.get("sender_id") != self.channel_name:
            await self.send(text_data=json.dumps({
                "action": "drawing_update",
                "payload": event["payload"]
            }))
