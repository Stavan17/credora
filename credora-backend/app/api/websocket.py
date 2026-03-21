from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from typing import Dict, List
import json
from app.core.security import decode_token
from app.core.database import get_db
from app.models.user import User
from sqlalchemy.orm import Session

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        # Maps user_id -> List[WebSocket]
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        print(f"✅ WebSocket connected for user {user_id}")

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        print(f"❌ WebSocket disconnected for user {user_id}")

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    print(f"Error sending ws message: {e}")

    async def broadcast(self, message: dict):
        for user_id, connections in self.active_connections.items():
            for connection in connections:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    print(f"Error broadcasting ws message: {e}")

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    # Authenticate token manually since we can't easily use Depends(get_current_user) in WS route securely
    try:
        payload = decode_token(token)
        email = payload.get("sub")
        if not email:
            await websocket.close(code=1008)
            return

        # We need a new session just to get the user
        db = next(get_db())
        user = db.query(User).filter(User.email == email).first()
        if not user:
            await websocket.close(code=1008)
            return
            
        user_id = user.id
    except Exception as e:
        print(f"WebSocket auth failed: {e}")
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, user_id)
    try:
        while True:
            # We don't expect messages from the client yet, just keep alive
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
