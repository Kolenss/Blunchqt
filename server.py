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
    allow_origins=["http://localhost:3000", "https://blunchqt.vercel.app"],  
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
        # Update the specific field for the topic
        supabase.table(topic.subject).update({
            topic.field: topic.value
        }).eq("id", topic.id).execute()
        
        return {"message": "Topic updated successfully", "id": topic.id}
    except Exception as e:
        return {"error": str(e)}

@app.get("/topics")
async def get_topics_by_subject(subject: str):
    try:
        response = supabase.table("topics").select("*").eq("subject", subject).execute()
        return response.data
    except Exception as e:
        return {"error": str(e)}

@app.post("/update_topic_status")
async def update_topic_status(update: TopicStatusUpdate):
    try:
        supabase.table("topics").update({
            "status": update.status
        }).eq("id", update.id).execute()
        
        return {"message": "Status updated successfully", "id": update.id}
    except Exception as e:
        return {"error": str(e)}

@app.post("/update_topic_comment")
async def update_topic_comment(update: TopicCommentUpdate):
    try:
        supabase.table("topics").update({
            "comment": update.comment
        }).eq("id", update.id).execute()
        
        return {"message": "Comment updated successfully", "id": update.id}
    except Exception as e:
        return {"error": str(e)}
