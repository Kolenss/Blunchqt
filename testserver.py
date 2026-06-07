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

@app.get("/topics")
async def get_topics_by_subject(subject: str):
    try:
        response = supabase.table("topics").select("*").eq("subject", subject).execute()
        print(response.data)
        return response.data
    except Exception as e:
        return {"error": str(e)}