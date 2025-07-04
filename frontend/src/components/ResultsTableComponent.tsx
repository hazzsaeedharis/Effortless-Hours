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
  Fade,
  Button,
  Box,
} from '@mui/material';

interface TimeLogEntry {
  Employee: string;
  Date: string;
  Time: string;
  Description: string;
  Subtask: string;
}

interface ResultsTableComponentProps {
  results: TimeLogEntry[];
  showToast?: (msg: string, type?: 'success' | 'error') => void;
}

function toCSV(rows: TimeLogEntry[]): string {
  const header = ['Employee', 'Date', 'Time', 'Description', 'Subtask'];
  const csvRows = [header.join(',')];
  for (const row of rows) {
    csvRows.push([
      row.Employee,
      row.Date,
      row.Time,
      '"' + row.Description.replace(/"/g, '""') + '"',
      '"' + (row.Subtask || '').replace(/"/g, '""') + '"',
    ].join(','));
  }
  return csvRows.join('\n');
}

const ResultsTableComponent: React.FC<ResultsTableComponentProps> = ({ results, showToast }) => {
  const handleExport = () => {
    const csv = toCSV(results);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'time_log_export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (showToast) showToast('Exported to CSV!', 'success');
  };

  if (results.length === 0) {
    return <Typography sx={{ mt: 2 }}>No data to display. Process some text to see the results.</Typography>;
  }

  return (
    <Fade in={true} timeout={600}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleExport}
            sx={{
              borderRadius: 3,
              fontWeight: 600,
              background: '#0071e3',
              boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
              px: 4,
              py: 1,
              transition: 'all 0.2s',
              '&:hover': { background: '#005bb5', transform: 'scale(1.04)' },
              '&:active': { transform: 'scale(0.98)' },
            }}
          >
            Export to CSV
          </Button>
        </Box>
        <TableContainer component={Paper} sx={{ mt: 0, borderRadius: 6, boxShadow: 6, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)' }}>
          <Table sx={{ minWidth: 650 }} aria-label="results table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#222', fontSize: 16 }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#222', fontSize: 16 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#222', fontSize: 16 }}>Time</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#222', fontSize: 16 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#222', fontSize: 16 }}>Subtask</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.Employee || ''}</TableCell>
                  <TableCell>{row.Date || ''}</TableCell>
                  <TableCell>{row.Time || ''}</TableCell>
                  <TableCell>{row.Description || ''}</TableCell>
                  <TableCell>{row.Subtask || ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Fade>
  );
};

export default ResultsTableComponent;
