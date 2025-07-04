import React from 'react';
import { Box, Typography, List, ListItemButton, ListItemText, Paper } from '@mui/material';

interface Project {
  id: number;
  name: string;
  description: string;
}

interface ProjectSelectorComponentProps {
  projects: Project[];
  onSelect: (projectId: number) => void;
}

const ProjectSelectorComponent: React.FC<ProjectSelectorComponentProps> = ({ projects, onSelect }) => {
  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Select a Project
      </Typography>
      <List>
        {projects.map((project: Project) => (
          <ListItemButton key={project.id} onClick={() => onSelect(project.id)}>
            <ListItemText primary={project.name} secondary={project.description} />
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
};

export default ProjectSelectorComponent; 