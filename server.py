from supabase.client import Client, create_client
from config import settings
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SECRET)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://blunchqt.vercel.app/"],  
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    id: int
    subject: str
    field: str
    value: str | bool

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

@app.post("/update_topic")
async def update_topic(topic: Message):
    try:
        # Update the specific field for the topic
        supabase.table(topic.subject).update({
            topic.field: topic.value
        }).eq("id", topic.id).execute()
        
        return {"message": "Topic updated successfully", "id": topic.id}
    except Exception as e:
        return {"error": str(e)}