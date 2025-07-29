#!/usr/bin/env python3
"""
Simple WebSocket client test for Django Channels
"""

import asyncio
import websockets
import json
import uuid

async def test_websocket():
    room_name = str(uuid.uuid4())
    uri = f"ws://localhost:8000/ws/editor/{room_name}/"
    
    print(f"Testing WebSocket connection to: {uri}")
    
    try:
        async with websockets.connect(uri) as websocket:
            print("✅ WebSocket connected successfully!")
            
            # Test join action
            join_message = {
                "action": "join",
                "username": "TestUser"
            }
            
            await websocket.send(json.dumps(join_message))
            print("📤 Sent join message")
            
            # Wait for response
            response = await websocket.recv()
            print(f"📥 Received: {response}")
            
            # Test code change
            code_message = {
                "action": "code-change",
                "code": "console.log('Hello World!');"
            }
            
            await websocket.send(json.dumps(code_message))
            print("📤 Sent code change message")
            
            # Wait for response
            response = await websocket.recv()
            print(f"📥 Received: {response}")
            
    except Exception as e:
        print(f"❌ WebSocket connection failed: {e}")

if __name__ == "__main__":
    print("Starting WebSocket test...")
    asyncio.run(test_websocket())
