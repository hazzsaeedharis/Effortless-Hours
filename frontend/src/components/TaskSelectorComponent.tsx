import React, { useState, useMemo } from 'react';
import { Typography, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface Task {
  name: string;
  subtasks?: Task[];
}

interface TaskSelectorComponentProps {
  tasks: Task[];
  onSelect: (taskPath: string[]) => void;
}

// Helper to flatten all leaf tasks with their full path
function getAllLeafPaths(tasks: Task[], path: string[] = []): string[][] {
  let result: string[][] = [];
  for (const task of tasks) {
    const newPath = [...path, task.name];
    if (!task.subtasks || task.subtasks.length === 0) {
      result.push(newPath);
    } else {
      result = result.concat(getAllLeafPaths(task.subtasks, newPath));
    }
  }
  return result;
}

const TaskSelectorComponent: React.FC<TaskSelectorComponentProps> = ({ tasks, onSelect }) => {
  const leafPaths = useMemo(() => getAllLeafPaths(tasks), [tasks]);
  const [selected, setSelected] = useState<string>('');

  const handleChange = (event: any) => {
    const value = event.target.value;
    setSelected(value);
    const pathArr = value.split(' > ');
    onSelect(pathArr);
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Select a Task
      </Typography>
      <FormControl fullWidth>
        <InputLabel id="task-select-label">Task</InputLabel>
        <Select
          labelId="task-select-label"
          value={selected}
          label="Task"
          onChange={handleChange}
        >
          {leafPaths.map((pathArr, idx) => (
            <MenuItem key={idx} value={pathArr.join(' > ')}>
              {pathArr.join(' > ')}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Paper>
  );
};

export default TaskSelectorComponent; 