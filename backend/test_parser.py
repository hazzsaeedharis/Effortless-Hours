from parser import parse_time_log

def test_parse_time_log_basic():
    text = 'John Doe\n1 April, 2025\n9:00 – 12:00 → Test Task'
    result = parse_time_log(text)
    assert isinstance(result, list)
    assert len(result) == 1
    entry = result[0]
    assert entry['employee'] == 'John Doe'
    assert entry['date'] == '1 April, 2025'
    assert entry['start_time'] == '9:00'
    assert entry['end_time'] == '12:00'
    assert entry['description'] == 'Test Task'
    assert entry['status'] == 'Unverified' 