import os
import re
import json
from datetime import datetime
from calendar import monthrange
import requests
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = os.getenv("GEMINI_API_URL")

# Helper: Load appendix2.json for project/task mapping
APPENDIX2_PATH = os.path.join(os.path.dirname(__file__), 'data', 'appendix2.json')
with open(APPENDIX2_PATH, 'r') as f:
    PROJECTS_DATA = json.load(f)

def validate_and_format_date(date_str):
    """
    Validates and normalizes a date string to MM:DD:YYYY format.
    Raises ValueError if invalid.
    """
    # Try multiple date formats
    formats = [
        "%d %B, %Y", "%d %b, %Y", "%d/%m/%Y", "%d/%m/%y", "%Y-%m-%d",
        "%d.%m.%Y", "%d.%m.%y", "%d %B %Y", "%d %b %Y"
    ]
    # Handle German weekday format: 'Montag, 1. April 2025'
    weekday_pattern = re.compile(r"^(?:Montag|Dienstag|Mittwoch|Donnerstag|Freitag), (\d{1,2})\. (\w+) (\d{4})$")
    match = weekday_pattern.match(date_str)
    if match:
        day, month_name, year = match.groups()
        try:
            dt = datetime.strptime(f"{day} {month_name} {year}", "%d %B %Y")
        except ValueError:
            dt = datetime.strptime(f"{day} {month_name} {year}", "%d %b %Y")
        return dt.strftime("%m:%d:%Y")
    for fmt in formats:
        try:
            dt = datetime.strptime(date_str, fmt)
            # Validate day for month/year
            _, max_day = monthrange(dt.year, dt.month)
            if not (1 <= dt.day <= max_day):
                raise ValueError(f"Invalid day {dt.day} for {dt.month}/{dt.year}")
            return dt.strftime("%m:%d:%Y")
        except Exception:
            continue
    raise ValueError(f"Invalid date format: {date_str}")

def validate_time(time_str):
    """
    Validates a time string (HH:MM or H:MM or H) and returns it in H:MM format.
    Raises ValueError if invalid.
    """
    if re.match(r"^\d{1,2}$", time_str):
        hour = int(time_str)
        minute = 0
    elif re.match(r"^\d{1,2}:\d{2}$", time_str):
        hour, minute = map(int, time_str.split(":"))
    else:
        raise ValueError(f"Invalid time format: {time_str}")
    if not (0 <= hour <= 24):
        raise ValueError(f"Hour out of range: {hour}")
    if not (0 <= minute <= 59):
        raise ValueError(f"Minute out of range: {minute}")
    if hour == 24 and minute != 0:
        raise ValueError(f"24:{minute:02d} is not a valid time (only 24:00 allowed)")
    return f"{hour}:{minute:02d}"

def call_openai_llm(text: str) -> list:
    client = openai.OpenAI(api_key=OPENAI_API_KEY)
    prompt = (
        "You are an expert assistant for extracting structured time log data from any text. "
        "For each record in the input, extract the following fields: Employee (name), Description (task), Date (in DD.MM.YYYY), Start Time (in HH:MM, 24-hour), End Time (in HH:MM, 24-hour). "
        "If a field is missing or cannot be determined, set its value to null. "
        "Return the output as a JSON array, with one object per record. "
        "\n\nHere are some examples of input and expected output:\n"
        "Input: Employee 1: Markus Lange\n1 April, 2025\n9:00 – 12:00 → Frontend-Insider-Tool Abstimmung\n"
        "Output: [\n  {\n    \"name\": \"Markus Lange\",\n    \"description\": \"Frontend-Insider-Tool Abstimmung\",\n    \"date\": \"01.04.2025\",\n    \"start_time\": \"09:00\",\n    \"end_time\": \"12:00\"\n  }\n]\n"
        "Input: Hi my name is Markus and I worked on task X on April 2 from 9-5 pm\n"
        "Output: [\n  {\n    \"name\": \"Markus\",\n    \"description\": \"task X\",\n    \"date\": \"02.04.2025\",\n    \"start_time\": \"09:00\",\n    \"end_time\": \"17:00\"\n  }\n]\n"
        "Input: John did some work\n"
        "Output: [\n  {\n    \"name\": \"John\",\n    \"description\": null,\n    \"date\": null,\n    \"start_time\": null,\n    \"end_time\": null\n  }\n]\n"
        "Input: Markus worked on X from 10:00 to 12:00. Sarah worked on Y on 3 April, 2025 from 13:00 to 15:00.\n"
        "Output: [\n  {\n    \"name\": \"Markus\",\n    \"description\": \"X\",\n    \"date\": null,\n    \"start_time\": \"10:00\",\n    \"end_time\": \"12:00\"\n  },\n  {\n    \"name\": \"Sarah\",\n    \"description\": \"Y\",\n    \"date\": \"03.04.2025\",\n    \"start_time\": \"13:00\",\n    \"end_time\": \"15:00\"\n  }\n]\n"
        "\nInput: " + text + "\nOutput:"
    )
    print("\n[DEBUG] OpenAI Prompt:\n", prompt)
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": prompt},
                {"role": "system", "content": f"Project/task definitions: {json.dumps(PROJECTS_DATA)}"}
            ],
            temperature=0,
            max_tokens=2048,
        )
        content = response.choices[0].message.content
        print("\n[DEBUG] OpenAI Raw Response:\n", content)
        match = re.search(r'\[.*\]', content, re.DOTALL)
        if match:
            parsed = json.loads(match.group(0))
            print("\n[DEBUG] OpenAI Parsed Output:\n", parsed)
            return parsed
        parsed = json.loads(content)
        print("\n[DEBUG] OpenAI Parsed Output (no match):\n", parsed)
        return parsed
    except Exception as e:
        print("\n[DEBUG] OpenAI Exception:\n", e)
        raise RuntimeError(f"OpenAI LLM parsing failed: {e}")

def call_gemini_llm(text: str) -> list:
    prompt = [
        {"role": "user", "parts": [
            {"text": (
                "Extract structured time log data from the following text. "
                "For each entry, output: Employee, Date (MM:DD:YYYY), Time (start-end), Description, Subtask (the most specific mapped subtask, e.g., '(ML) - EuP - April'25'). "
                "If mapping is ambiguous, set Subtask to 'Ambiguous (requires verification)'. "
                "Output a JSON array.\nText:\n" + text +
                f"\nProject/task definitions: {json.dumps(PROJECTS_DATA)}"
            )}
        ]}
    ]
    headers = {"Content-Type": "application/json"}
    url = f"{GEMINI_API_URL}?key={GEMINI_API_KEY}"
    try:
        resp = requests.post(url, headers=headers, data=json.dumps({"contents": prompt}))
        resp.raise_for_status()
        result = resp.json()
        content = result['candidates'][0]['content']['parts'][0]['text']
        match = re.search(r'\[.*\]', content, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        return json.loads(content)
    except Exception as e:
        raise RuntimeError(f"Gemini LLM parsing failed: {e}")

def regex_fallback_parse(text: str) -> list:
    """
    Regex-based fallback parser. Attempts to match employee, date, time, description, and map to project/task using appendix2.json. Returns list of dicts with required columns.
    """
    entries = []
    current_employee = None
    current_date = None
    lines = text.split('\n')
    for line in lines:
        line = line.strip()
        if not line:
            continue
        # Employee
        employee_match = re.match(r"employee \d+: (.+)", line, re.IGNORECASE)
        if employee_match:
            current_employee = employee_match.group(1).strip()
            current_date = None
            continue
        # Date
        date_match = re.match(
            r"^((\d{1,2} \w+, \d{4})|(\d{1,2}/\d{1,2}/\d{2,4})|((?:Montag|Dienstag|Mittwoch|Donnerstag|Freitag), \d{1,2}\. \w+ \d{4})|(\d{4}-\d{2}-\d{2}))\s*$",
            line
        )
        if date_match:
            raw_date = next((g for g in date_match.groups() if g is not None), None)
            try:
                current_date = validate_and_format_date(raw_date)
            except Exception:
                current_date = None
            continue
        # Time log
        log_match = re.match(
            r"^\s*(\d{1,2}:\d{2}|\d{1,2})\s*[–-]\s*(\d{1,2}:\d{2}|\d{1,2})\s*(?:→|->|–|-)?\s*(.+)$",
            line
        )
        if not log_match:
            log_match = re.match(
                r"^\s*(\d{1,2}:?\d{0,2})\s*[–-]\s*(\d{1,2}:?\d{0,2})\s+(.+)$",
                line
            )
        if log_match and current_employee and current_date:
            start_time, end_time, description = log_match.groups()
            # Map to subtask
            subtask = map_description_to_subtask(description)
            entry = {
                "Employee": current_employee,
                "Date": current_date,
                "Time": f"{start_time.strip()}-{end_time.strip()}",
                "Description": description.strip(),
                "Subtask": subtask or "Ambiguous (requires verification)"
            }
            entries.append(entry)
    return entries

def map_description_to_subtask(description):
    """
    Find the most specific subtask (deepest match) whose name appears in the description.
    Returns subtask name or None if not found.
    """
    for project in PROJECTS_DATA.get('projects', []):
        for task in project.get('Tasks', []):
            for sub1 in task.get('subtasks', []):
                for sub2 in sub1.get('subtasks', []):
                    for sub3 in sub2.get('subtasks', []):
                        if sub3['name'].lower() in description.lower():
                            return sub3['name']
                    if sub2['name'].lower() in description.lower():
                        return sub2['name']
                if sub1['name'].lower() in description.lower():
                    return sub1['name']
            if task['name'].lower() in description.lower():
                return task['name']
        if project['name'].lower() in description.lower():
            return project['name']
    return None

def standardize_entry(entry):
    return {
        "Employee": entry.get("name") or entry.get("Employee") or "",
        "Date": entry.get("date") or entry.get("Date") or "",
        "Time": (
            f"{entry.get('start_time', '')} - {entry.get('end_time', '')}"
            if entry.get("start_time") and entry.get("end_time")
            else entry.get("Time", "")
        ),
        "Description": entry.get("description") or entry.get("Description") or "",
        "Subtask": entry.get("subtask") or entry.get("Subtask") or "",
    }

def parse_time_log(text: str, return_errors=False) -> list:
    """
    Tries OpenAI, then Gemini, then regex fallback. Returns list of dicts with required columns. If return_errors=True, returns (data, errors).
    """
    print("\n[DEBUG] parse_time_log input:\n", text)
    errors = []
    try:
        result = call_openai_llm(text)
        # Standardize OpenAI output fields for frontend
        standardized = [standardize_entry(e) for e in result]
        print("\n[DEBUG] parse_time_log OpenAI result (standardized):\n", standardized)
        return (standardized, errors) if return_errors else standardized
    except Exception as e:
        errors.append(str(e))
    try:
        result = call_gemini_llm(text)
        print("\n[DEBUG] parse_time_log Gemini result:\n", result)
        return (result, errors) if return_errors else result
    except Exception as e:
        errors.append(str(e))
    try:
        # Regex fallback with strict validation and error aggregation
        entries = []
        current_employee = None
        current_date = None
        lines = text.split('\n')
        for line in lines:
            line = line.strip()
            if not line:
                continue
            employee_match = re.match(r"employee \d+: (.+)", line, re.IGNORECASE)
            if employee_match:
                current_employee = employee_match.group(1).strip()
                current_date = None
                continue
            date_match = re.match(
                r"^((\d{1,2} \w+, \d{4})|(\d{1,2}/\d{1,2}/\d{2,4})|((?:Montag|Dienstag|Mittwoch|Donnerstag|Freitag), \d{1,2}\. \w+ \d{4})|(\d{4}-\d{2}-\d{2}))\s*$",
                line
            )
            if date_match:
                raw_date = next((g for g in date_match.groups() if g is not None), None)
                try:
                    current_date = validate_and_format_date(raw_date)
                except Exception as e:
                    errors.append(f"Invalid date '{raw_date}': {e}")
                    current_date = None
                continue
            log_match = re.match(
                r"^\s*(\d{1,2}:\d{2}|\d{1,2})\s*[–-]\s*(\d{1,2}:\d{2}|\d{1,2})\s*(?:→|->|–|-)?\s*(.+)$",
                line
            )
            if not log_match:
                log_match = re.match(
                    r"^\s*(\d{1,2}:?\d{0,2})\s*[–-]\s*(\d{1,2}:?\d{0,2})\s+(.+)$",
                    line
                )
            if log_match and current_employee and current_date:
                start_time, end_time, description = log_match.groups()
                try:
                    start_time_fmt = validate_time(start_time.strip())
                except Exception as e:
                    errors.append(f"Invalid start time '{start_time}': {e}")
                    start_time_fmt = start_time.strip()
                try:
                    end_time_fmt = validate_time(end_time.strip())
                except Exception as e:
                    errors.append(f"Invalid end time '{end_time}': {e}")
                    end_time_fmt = end_time.strip()
                subtask = map_description_to_subtask(description)
                entry = {
                    "Employee": current_employee,
                    "Date": current_date,
                    "Time": f"{start_time_fmt}-{end_time_fmt}",
                    "Description": description.strip(),
                    "Subtask": subtask or "Ambiguous (requires verification)"
                }
                entries.append(entry)
        print("\n[DEBUG] parse_time_log Regex result:\n", entries)
        return (entries, errors) if return_errors else entries
    except Exception as e:
        errors.append(str(e))
    if return_errors:
        return [], errors
    raise RuntimeError("All parsing methods failed: " + "; ".join(errors))
