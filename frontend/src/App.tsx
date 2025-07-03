import React, { useState } from 'react';
import { Container, Typography, Box, Alert } from '@mui/material';
import TextInputComponent from './components/TextInputComponent';
import ResultsTableComponent from './components/ResultsTableComponent';
import axios from 'axios';

// --- Configuration ---
const API_URL = 'http://localhost:8001';
//const API_KEY = 'your-secret-api-key';

interface TimeLogEntry {
  employee: string;
  date: string;
  start_time: string;
  end_time: string;
  description: string;
  status: string;
}

function App() {
  const [results, setResults] = useState<TimeLogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleProcessText = async (text: string) => {
    setError(null);
    try {
      const response = await axios.post(
        `${API_URL}/api/v1/parse-text`,
        { text },
        //{ headers: { 'x-api-key': API_KEY } }
      );
      setResults(response.data.data);
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        setError(`Error: ${err.response.status} - ${err.response.data.detail}`);
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          PDM Hour Logging Tool
        </Typography>
        <TextInputComponent onProcess={handleProcessText} />
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <ResultsTableComponent results={results} />
      </Box>
    </Container>
  );
}

export default App;
