from fastapi import FastAPI, HTTPException, Depends, Header, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import json
import os
from parser import parse_time_log
#from models import WorkLog, Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List

# --- Configuration ---
# API_KEY = "your-secret-api-key"  # In a real app, use environment variables

# --- FastAPI App Initialization ---
app = FastAPI(
    title="PDM Hour Logging API",
    description="API for parsing and processing employee hour logs.",
    version="1.0.0"
)

# --- CORS Middleware ---
# This allows the React frontend (running on a different port) to communicate with the backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend's domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Security ---
# def verify_api_key(x_api_key: str = Header(...)):
#     """Dependency to verify the API key in the request header."""
#     if x_api_key != API_KEY:
#         raise HTTPException(status_code=401, detail="Invalid API Key")

# --- Data Loading ---
def load_data():
    """Loads the necessary data files."""
    try:
        # Correctly locate the data files relative to main.py
        base_dir = os.path.dirname(os.path.abspath(__file__))
        appendix2_path = os.path.join(base_dir, 'data', 'appendix2.json')
        task_mapping_path = os.path.join(base_dir, 'data', 'Shadow_Calendar_Task_Mapping.csv')

        with open(appendix2_path, 'r') as f:
            projects_data = json.load(f)
        
        task_mapping_df = pd.read_csv(task_mapping_path)
        
        return projects_data, task_mapping_df
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=f"Data file not found: {e.filename}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading data: {str(e)}")

# --- Pydantic Models ---
class ParseRequest(BaseModel):
    text: str
    task_path: list[str] = []

class ParseResponse(BaseModel):
    message: str
    data: list = []
    errors: list = []

# --- API Endpoints ---
@app.get("/", tags=["General"])
async def read_root():
    """Root endpoint to check if the API is running."""
    return {"message": "Welcome to the PDM Hour Logging API!"}

@app.post("/api/v1/parse-text", response_model=ParseResponse, tags=["Parsing"])
async def parse_text_endpoint(request: ParseRequest):
    """
    Parses the raw text input to identify and structure time entries.
    """
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Input text cannot be empty.")

    # --- Use the parsing engine ---
    parsed_data, errors = parse_time_log(request.text, return_errors=True)

    # If task_path is provided, override Subtask for all entries
    if request.task_path:
        subtask = request.task_path[-1]
        for entry in parsed_data:
            entry['Subtask'] = subtask

    return {
        "message": "Text parsed successfully.",
        "data": parsed_data,
        "errors": errors
    }

# To run this app:
# 1. Make sure you have a `data` directory with the required files.
# 2. In your terminal, navigate to the `backend` directory.
# 3. Run the command: uvicorn main:app --reload
