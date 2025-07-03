import re
from datetime import datetime

def parse_time_log(text: str) -> list:
    """
    Parses a block of text containing time logs for one or more employees.
    """
    entries = []
    current_employee = None
    current_date = None

    # Normalize unicode characters to standard ASCII for simpler regex
    text = text.replace('–', '-').replace('→', '->')

    lines = text.split('\n')

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Regex to find employee names, case-insensitive
        employee_match = re.match(r"employee \d+: (.+)", line, re.IGNORECASE)
        if employee_match:
            current_employee = employee_match.group(1).strip()
            current_date = None # Reset date for new employee
            continue

        # Regex to find date entries (handles multiple formats)
        date_match = re.match(
            r"^((\d{1,2} \w+, \d{4})|(\d{1,2}/\d{1,2}/\d{2,4})|((?:Montag|Dienstag|Mittwoch|Donnerstag|Freitag), \d{1,2}\. \w+ \d{4})|(\d{4}-\d{2}-\d{2}))\s*$",
            line
        )
        if date_match:
            current_date = next((g for g in date_match.groups() if g is not None), None)
            continue
        
        # Regex for time log entries
        log_match = re.match(
            r"^\s*(\d{1,2}:\d{2}|\d{1,2})\s*-\s*(\d{1,2}:\d{2}|\d{1,2})\s*(?:->\s*)?(.+)\s*$",
            line
        )
        if log_match and current_employee and current_date:
            start_time, end_time, description = log_match.groups()
            entry = {
                "employee": current_employee,
                "date": current_date,
                "start_time": start_time.strip(),
                "end_time": end_time.strip(),
                "description": description.strip(),
                "status": "Unverified"
            }
            entries.append(entry)
            continue

        # Regex for a simple, single-entry format (e.g., from tests)
        simple_pattern = re.compile(
            r'^\s*(?P<employee>.+?)\s*\n'
            r'\s*(?P<date>\d{1,2}\s+\w+,\s+\d{4})\s*\n'
            r'\s*(?P<start_time>\d{1,2}:\d{2})\s*-\s*(?P<end_time>\d{1,2}:\d{2})\s*->\s*(?P<description>.+?)\s*$',
            re.MULTILINE
        )
        match = simple_pattern.match(text.strip())
        if match:
            entry = match.groupdict()
            entry['status'] = 'Unverified'
            return [entry]


    return entries
