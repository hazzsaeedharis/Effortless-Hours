import re
from datetime import datetime

def parse_time_log(text: str) -> list:
    """
    Parses a block of text containing time logs for one or more employees.
    It first attempts to parse a simple, single-entry format, and falls back
    to a more complex, multi-entry format.
    """
    # Normalize unicode characters to standard ASCII for simpler regex
    normalized_text = text.replace('–', '-').replace('→', '->')

    # Regex for a simple, single-entry format (e.g., from tests)
    simple_pattern = re.compile(
        r'^\s*(?P<employee>.+?)\s*\n'
        r'\s*(?P<date>\d{1,2}\s+\w+,\s+\d{4})\s*\n'
        r'\s*(?P<start_time>\d{1,2}:\d{2})\s*-\s*(?P<end_time>\d{1,2}:\d{2})\s*->\s*(?P<description>.+?)\s*$',
        re.MULTILINE
    )
    
    match = simple_pattern.match(normalized_text.strip())
    if match:
        entry = match.groupdict()
        entry['status'] = 'Unverified'
        return [entry]

    # Fallback to the original, more complex parser for other formats
    entries = []
    current_employee = None
    current_date = None

    # Regex to find employee names, case-insensitive
    employee_regex = re.compile(r"employee \d+: (.+)", re.IGNORECASE)
    
    # Regex to find date entries (handles multiple formats)
    date_regex = re.compile(
        r"^(?:"
        r"(\d{1,2} \w+, \d{4})|"  # 1 April, 2025
        r"(\d{1,2}/\d{1,2}/\d{2,4})|"  # 2/4/25
        r"((?:Montag|Dienstag|Mittwoch|Donnerstag|Freitag), \d{1,2}\. \w+ \d{4})|"  # Donnerstag, 3. April 2025
        r"(\d{4}-\d{2}-\d{2})"  # 2025-04-04
        r")\s*$"
    )

    # A more universal regex for time and description
    time_log_regex = re.compile(
        r"^\s*"
        r"(\d{1,2}:\d{2}|\d{1,2})"  # Start time (e.g., 9:00 or 8)
        r"\s*[-–]\s*"  # Separator (en-dash or hyphen)
        r"(\d{1,2}:\d{2}|\d{1,2})"  # End time (e.g., 12:00 or 10)
        r"\s*(?:[→•–]\s*)?"  # Optional separator
        r"(.+)"  # Description
        r"\s*$"
    )

    lines = text.split('\n')

    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue

        # Check for employee name
        employee_match = employee_regex.match(line)
        if employee_match:
            current_employee = employee_match.group(1).strip()
            current_date = None # Reset date for new employee
            continue

        # Check for date
        date_match = date_regex.match(line)
        if date_match:
            current_date = next((g for g in date_match.groups() if g is not None), None)
            continue
        
        if not current_employee or not current_date:
            continue

        # Check for time log entries
        log_match = time_log_regex.match(line)

        if log_match:
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

    return entries
