import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';

interface TimeLogEntry {
  employee: string;
  date: string;
  start_time: string;
  end_time: string;
  description: string;
  status: string;
}

interface ResultsTableComponentProps {
  results: TimeLogEntry[];
}

const ResultsTableComponent: React.FC<ResultsTableComponentProps> = ({ results }) => {
  if (results.length === 0) {
    return <Typography sx={{ mt: 2 }}>No data to display. Process some text to see the results.</Typography>;
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Table sx={{ minWidth: 650 }} aria-label="results table">
        <TableHead>
          <TableRow>
            <TableCell>Employee</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Start Time</TableCell>
            <TableCell>End Time</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {results.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.employee}</TableCell>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.start_time}</TableCell>
              <TableCell>{row.end_time}</TableCell>
              <TableCell>{row.description}</TableCell>
              <TableCell>{row.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ResultsTableComponent;
