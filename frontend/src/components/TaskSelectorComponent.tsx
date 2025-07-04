import React from 'react';
import { Box, Typography, List, ListItemButton, ListItemText, Paper } from '@mui/material';

interface Task {
  name: string;
  subtasks?: Task[];
}

interface TaskSelectorComponentProps {
  tasks: Task[];
  onSelect: (taskName: string) => void;
}

const TaskSelectorComponent: React.FC<TaskSelectorComponentProps> = ({ tasks, onSelect }) => {
  // Flatten all subtasks for selection
  const allTaskNames: string[] = [];
  tasks.forEach((task: Task) => {
    if (task.name) allTaskNames.push(task.name);
    if (task.subtasks) {
      task.subtasks.forEach((sub1: Task) => {
        if (sub1.name) allTaskNames.push(sub1.name);
        if (sub1.subtasks) {
          sub1.subtasks.forEach((sub2: Task) => {
            if (sub2.name) allTaskNames.push(sub2.name);
            if (sub2.subtasks) {
              sub2.subtasks.forEach((sub3: Task) => {
                if (sub3.name) allTaskNames.push(sub3.name);
              });
            }
          });
        }
      });
    }
  });
  // Remove duplicates
  const uniqueTaskNames = Array.from(new Set(allTaskNames));

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Select a Task
      </Typography>
      <List>
        {uniqueTaskNames.map((taskName) => (
          <ListItemButton key={taskName} onClick={() => onSelect(taskName)}>
            <ListItemText primary={taskName} />
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
};

export default TaskSelectorComponent; 