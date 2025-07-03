import React from 'react';
import { TextField, Button, Box } from '@mui/material';

interface TextInputComponentProps {
  onProcess: (text: string) => void;
}

const TextInputComponent: React.FC<TextInputComponentProps> = ({ onProcess }) => {
  const [text, setText] = React.useState('');

  const handleProcessClick = () => {
    onProcess(text);
  };

  return (
    <Box>
      <TextField
        label="Paste your time log here"
        multiline
        rows={15}
        fullWidth
        variant="outlined"
        value={text}
        onChange={(e) => setText(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleProcessClick}
        disabled={!text.trim()}
      >
        Process Text
      </Button>
    </Box>
  );
};

export default TextInputComponent;
