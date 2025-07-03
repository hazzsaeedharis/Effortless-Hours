from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_parse_text_endpoint():
    text = 'John Doe\n1 April, 2025\n9:00 – 12:00 → Test Task'
    response = client.post('/api/v1/parse-text', json={'text': text})
    assert response.status_code == 200
    data = response.json()['data']
    assert isinstance(data, list)
    assert len(data) == 1
    entry = data[0]
    assert entry['employee'] == 'John Doe'
    assert entry['date'] == '1 April, 2025'
    assert entry['start_time'] == '9:00'
    assert entry['end_time'] == '12:00'
    assert entry['description'] == 'Test Task'
    assert entry['status'] == 'Unverified' 