from supabase.client import Client, create_client
from config import settings
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import json
from typing import Dict, Set
import asyncio
from fastapi import websockets

app = FastAPI()

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SECRET)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        # Store active connections by endpoint
        self.active_connections: Dict[str, Set[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, endpoint: str):
        await websocket.accept()
        if endpoint not in self.active_connections:
            self.active_connections[endpoint] = set()
        self.active_connections[endpoint].add(websocket)
    
    def disconnect(self, websocket: WebSocket, endpoint: str):
        if endpoint in self.active_connections:
            self.active_connections[endpoint].discard(websocket)
    
    async def broadcast(self, message: dict, endpoint: str):
        if endpoint in self.active_connections:
            disconnected = set()
            for connection in self.active_connections[endpoint]:
                try:
                    await connection.send_json(message)
                except Exception:
                    disconnected.add(connection)
            
            # Remove disconnected clients
            for conn in disconnected:
                self.active_connections[endpoint].discard(conn)

manager = ConnectionManager()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://blunchqt.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    id: int
    subject: str
    field: str
    value: str | bool

class TopicStatusUpdate(BaseModel):
    id: int
    status: str

class TopicCommentUpdate(BaseModel):
    id: int
    comment: str

class ScoreUpdate(BaseModel):
    id: int
    table: str
    field: str
    value: str | int

class NewScore(BaseModel):
    table: str
    drill: str
    drill_date: str | None = None
    score: int
    mistakes: int
    total: int

@app.websocket("/ws")
async def websocket_endpoint(websocket: websockets.WebSocket):
    await websocket.accept()

    while True:
        data = await websocket.receive_text()
        
        await websocket.send_text(f"Message received: {data}")

@app.get("/abnormal_psychology")
async def get_topics():
    response = supabase.table("abnormal_psychology").select("*").execute()   
    return response.data

@app.get("/developmental_psychology")
async def get_topics():
    response = supabase.table("developmental_psychology").select("*").execute()   
    return response.data

@app.get("/psychology_assessment")
async def get_topics():
    response = supabase.table("psychology_assessment").select("*").execute()   
    return response.data

@app.get("/industrial_psychology")
async def get_topics():
    response = supabase.table("industrial_psychology").select("*").execute()   
    return response.data

@app.get("/abnormal_psychology_score")
async def get_abnormal_scores():
    response = supabase.table("abnormal_psychology_score").select("*").execute()   
    return response.data

@app.get("/developmental_psychology_score")
async def get_developmental_scores():
    response = supabase.table("developmental_psychology_score").select("*").execute()   
    return response.data

@app.get("/psychological_assessment_score")
async def get_assessment_scores():
    response = supabase.table("psychological_assessment_score").select("*").execute()   
    return response.data

@app.get("/industrial_organizational_psychology_score")
async def get_industrial_scores():
    response = supabase.table("industrial_organizational_psychology_score").select("*").execute()   
    return response.data

@app.post("/update_topic")
async def update_topic(topic: Message):
    try:
        supabase.table(topic.subject).update({
            topic.field: topic.value
        }).eq("id", topic.id).execute()

        await manager.broadcast({
            "type": "update",
            "id": topic.id,
            "field": topic.field,
            "value": topic.value
        }, f"tracker_{topic.subject}")

        return {"message": "Topic updated successfully", "id": topic.id}
    except Exception as e:
        return {"error": str(e)}

@app.get("/topics")
async def get_topics_by_subject(subject: str):
    try:
        response = supabase.table("topics").select("*").eq("subject", subject).order("main_topic").order("topic_number").execute()
        print(response.data)
        return response.data
    except Exception as e:
        return {"error": str(e)}

@app.post("/update_topic_status")
async def update_topic_status(update: TopicStatusUpdate):
    try:
        supabase.table("topics").update({
            "status": update.status
        }).eq("id", update.id).execute()

        topic_row = supabase.table("topics").select("subject").eq("id", update.id).limit(1).execute()
        if topic_row.data:
            subject = topic_row.data[0]["subject"]
            await manager.broadcast({
                "type": "update",
                "id": update.id,
                "field": "status",
                "value": update.status
            }, f"topics_{subject}")

        return {"message": "Status updated successfully", "id": update.id}
    except Exception as e:
        return {"error": str(e)}

@app.post("/update_topic_comment")
async def update_topic_comment(update: TopicCommentUpdate):
    try:
        supabase.table("topics").update({
            "comment": update.comment
        }).eq("id", update.id).execute()

        topic_row = supabase.table("topics").select("subject").eq("id", update.id).limit(1).execute()
        if topic_row.data:
            subject = topic_row.data[0]["subject"]
            await manager.broadcast({
                "type": "update",
                "id": update.id,
                "field": "comment",
                "value": update.comment
            }, f"topics_{subject}")

        return {"message": "Comment updated successfully", "id": update.id}
    except Exception as e:
        return {"error": str(e)}

@app.post("/update_score")
async def update_score(update: ScoreUpdate):
    try:
        supabase.table(update.table).update({
            update.field: update.value
        }).eq("id", update.id).execute()
        
        # Broadcast update to all connected clients
        await manager.broadcast({
            "type": "update",
            "table": update.table,
            "id": update.id,
            "field": update.field,
            "value": update.value
        }, update.table)
        
        return {"message": "Score updated successfully", "id": update.id}
    except Exception as e:
        return {"error": str(e)}

@app.post("/add_score")
async def add_score(new_score: NewScore):
    try:
        print(f"Attempting to add score to table: {new_score.table}")
        print(f"Data: {new_score.dict()}")
        
        # Supabase insert - Don't insert 'average' as it's a generated column
        result = supabase.table(new_score.table).insert({
            "drill": new_score.drill,
            "drill_date": new_score.drill_date,
            "score": new_score.score,
            "mistakes": new_score.mistakes,
            "total": new_score.total
        }).execute()
        
        print(f"Insert result: {result}")
        print(f"Insert data: {result.data}")
        
        # Broadcast new data to all connected clients
        if result.data:
            await manager.broadcast({
                "type": "insert",
                "table": new_score.table,
                "data": result.data
            }, new_score.table)
        
        # Verify the insert by querying the table
        verify = supabase.table(new_score.table).select("*").order("id", desc=True).limit(1).execute()
        print(f"Latest record in table: {verify.data}")
        
        # Check if insert was successful
        if result.data:
            return {"message": "Score added successfully", "data": result.data, "verified": verify.data}
        else:
            return {"error": "Insert returned no data", "result": str(result)}
            
    except Exception as e:
        print(f"Error adding score: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": str(e), "type": type(e).__name__}


# WebSocket endpoints for real-time data
@app.websocket("/ws/scores/{table_name}")
async def websocket_scores(websocket: WebSocket, table_name: str):
    await manager.connect(websocket, table_name)
    try:
        # Send initial data
        response = supabase.table(table_name).select("*").execute()
        await websocket.send_json({
            "type": "initial",
            "data": response.data
        })
        
        # Keep connection alive and listen for messages
        while True:
            data = await websocket.receive_text()
            # Echo back to confirm connection is alive
            await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(websocket, table_name)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket, table_name)

@app.websocket("/ws/topics/{subject}")
async def websocket_topics(websocket: WebSocket, subject: str):
    endpoint = f"topics_{subject}"
    await manager.connect(websocket, endpoint)
    try:
        # Send initial data
        response = supabase.table("topics").select("*").eq("subject", subject).order("main_topic").order("topic_number").execute()
        await websocket.send_json({
            "type": "initial",
            "data": response.data
        })
        
        # Keep connection alive
        while True:
            data = await websocket.receive_text()
            await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(websocket, endpoint)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket, endpoint)

@app.websocket("/ws/tracker/{subject}")
async def websocket_tracker(websocket: WebSocket, subject: str):
    endpoint = f"tracker_{subject}"
    await manager.connect(websocket, endpoint)
    try:
        response = supabase.table(subject).select("*").execute()
        await websocket.send_json({
            "type": "initial",
            "data": response.data
        })

        while True:
            data = await websocket.receive_text()
            await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(websocket, endpoint)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket, endpoint)

@app.websocket("/ws/dsm5")
async def websocket_dsm5(websocket: WebSocket):
    endpoint = "dsm5"
    await manager.connect(websocket, endpoint)
    try:
        response = supabase.table("dsm5_disorders").select("*").execute()
        await websocket.send_json({
            "type": "initial",
            "data": response.data
        })

        while True:
            data = await websocket.receive_text()
            await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(websocket, endpoint)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket, endpoint)

@app.get("/progress")
async def get_progress():
    try:
        subjects = [
            "ABNORMAL PSYCHOLOGY",
            "DEVELOPMENTAL PSYCHOLOGY",
            "INDUSTRIAL ORGANIZATIONAL PSYCHOLOGY",
            "PSYCHOLOGICAL ASSESSMENT",
        ]
        result = {}
        for subj in subjects:
            rows = supabase.table("topics").select("status").eq("subject", subj).execute()
            total = len(rows.data) if rows.data else 0
            completed = sum(1 for r in rows.data if r["status"] == "done") if rows.data else 0
            result[subj] = {"total": total, "completed": completed, "remaining": total - completed}
        return result
    except Exception as e:
        return {"error": str(e)}

@app.get("/dsm5_disorders")
async def get_dsm5_disorders():
    response = supabase.table("dsm5_disorders").select("*").execute()
    return response.data

class CoinEarnRequest(BaseModel):
    source_type: str
    source_table: str
    source_id: int
    source_field: str
    amount: int = 1

class ShopPurchaseRequest(BaseModel):
    item_id: str
    price: int

class DSM5Update(BaseModel):
    id: int
    field: str
    value: bool

@app.post("/update_dsm5")
async def update_dsm5(update: DSM5Update):
    try:
        supabase.table("dsm5_disorders").update({
            update.field: update.value
        }).eq("id", update.id).execute()

        await manager.broadcast({
            "type": "update",
            "id": update.id,
            "field": update.field,
            "value": update.value
        }, "dsm5")

        return {"message": "DSM-5 topic updated successfully", "id": update.id}
    except Exception as e:
        return {"error": str(e)}

@app.get("/coins")
async def get_coins():
    try:
        response = supabase.table("coin_transactions").select("amount").execute()
        balance = sum(row["amount"] for row in response.data) if response.data else 0
        return {"balance": balance}
    except Exception as e:
        return {"balance": 0}

@app.post("/coins/earn")
async def earn_coin(req: CoinEarnRequest):
    try:
        existing = supabase.table("coin_transactions").select("id").eq(
            "source_type", req.source_type
        ).eq(
            "source_table", req.source_table
        ).eq(
            "source_id", req.source_id
        ).eq(
            "source_field", req.source_field
        ).eq(
            "kind", "earn"
        ).execute()

        if existing.data:
            balance_resp = supabase.table("coin_transactions").select("amount").execute()
            balance = sum(row["amount"] for row in balance_resp.data) if balance_resp.data else 0
            return {"awarded": False, "balance": balance}

        supabase.table("coin_transactions").insert({
            "amount": req.amount,
            "kind": "earn",
            "source_type": req.source_type,
            "source_table": req.source_table,
            "source_id": req.source_id,
            "source_field": req.source_field
        }).execute()

        balance_resp = supabase.table("coin_transactions").select("amount").execute()
        balance = sum(row["amount"] for row in balance_resp.data) if balance_resp.data else 0
        return {"awarded": True, "balance": balance}
    except Exception as e:
        return {"awarded": False, "balance": 0, "error": str(e)}

@app.post("/shop/purchase")
async def shop_purchase(req: ShopPurchaseRequest):
    try:
        balance_resp = supabase.table("coin_transactions").select("amount").execute()
        balance = sum(row["amount"] for row in balance_resp.data) if balance_resp.data else 0

        if balance < req.price:
            return {"purchased": False, "error": "Not enough coins", "balance": balance}

        supabase.table("coin_transactions").insert({
            "amount": -req.price,
            "kind": "spend",
            "item_id": req.item_id,
            "note": f"Purchased {req.item_id}"
        }).execute()

        new_balance = balance - req.price
        return {"purchased": True, "balance": new_balance}
    except Exception as e:
        return {"purchased": False, "error": str(e), "balance": 0}
