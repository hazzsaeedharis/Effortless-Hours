import { useState } from 'react';
import { Container, Typography, Box, Alert, Stepper, Step, StepLabel, Button, Paper, Card, CardContent, Fade, Slide } from '@mui/material';
import TextInputComponent from './components/TextInputComponent';
import ResultsTableComponent from './components/ResultsTableComponent';
import ProjectSelectorComponent from './components/ProjectSelectorComponent';
import TaskSelectorComponent from './components/TaskSelectorComponent';
import axios from 'axios';
import appendix2 from './assets/appendix2.json';

// --- Configuration ---
const API_URL = 'http://localhost:8001';
//const API_KEY = 'your-secret-api-key';

interface Project {
  id: number;
  name: string;
  description: string;
  Tasks: Task[];
}
interface Task {
  name: string;
  subtasks?: Task[];
}
interface TimeLogEntry {
  Employee: string;
  Date: string;
  Time: string;
  Description: string;
  Subtask: string;
}

const steps = ['Select Project', 'Select Task', 'Paste Time Log', 'Review Results'];

function App() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [logText, setLogText] = useState<string>('');
  const [results, setResults] = useState<TimeLogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Project/task data from appendix2.json
  const projects: Project[] = (appendix2 as any).projects;
  const tasks: Task[] = selectedProject ? projects.find((p: Project) => p.id === selectedProject)?.Tasks || [] : [];

  const handleProjectSelect = (projectId: number) => {
    setSelectedProject(projectId);
    setSelectedTask(null);
    setActiveStep(1);
  };
  const handleTaskSelect = (taskName: string) => {
    setSelectedTask(taskName);
    setActiveStep(2);
  };
  const handleProcessText = async (text: string) => {
    setLogText(text);
    setError(null);
    try {
      const response = await axios.post(
        `${API_URL}/api/v1/parse-text`,
        { text },
        //{ headers: { 'x-api-key': API_KEY } }
      );
      setResults(response.data.data);
      setActiveStep(3);
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        setError(`Error: ${err.response.status} - ${err.response.data.detail}`);
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };
  const handleReset = () => {
    setActiveStep(0);
    setSelectedProject(null);
    setSelectedTask(null);
    setLogText('');
    setResults([]);
    setError(null);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          PDM Hour Logging Tool
        </Typography>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>
        {/* Chat bubble UI for each step */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', minHeight: 300 }}>
          {activeStep === 0 && (
            <Slide direction="up" in={true} mountOnEnter unmountOnExit>
              <Card sx={{ maxWidth: 500, bgcolor: '#f5f5f5', borderRadius: 4, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    👋 Hi! Please select your project to begin.
                  </Typography>
                  <ProjectSelectorComponent projects={projects} onSelect={handleProjectSelect} />
                </CardContent>
              </Card>
            </Slide>
          )}
          {activeStep === 1 && (
            <Slide direction="up" in={true} mountOnEnter unmountOnExit>
              <Card sx={{ maxWidth: 500, bgcolor: '#e3f2fd', borderRadius: 4, boxShadow: 3, alignSelf: 'flex-end' }}>
                <CardContent>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    📁 Great! Now select the task you worked on.
                  </Typography>
                  <TaskSelectorComponent tasks={tasks} onSelect={handleTaskSelect} />
                </CardContent>
              </Card>
            </Slide>
          )}
          {activeStep === 2 && (
            <Fade in={true} timeout={600}>
              <Card sx={{ maxWidth: 500, bgcolor: '#fffde7', borderRadius: 4, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    📝 Paste your time log below and hit Process!
                  </Typography>
                  <TextInputComponent onProcess={handleProcessText} />
                </CardContent>
              </Card>
            </Fade>
          )}
          {activeStep === 3 && (
            <Fade in={true} timeout={600}>
              <Box sx={{ width: '100%' }}>
                <ResultsTableComponent results={results} />
              </Box>
            </Fade>
          )}
        </Box>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Box sx={{ mt: 4 }}>
          <Button variant="outlined" onClick={handleReset}>Start Over</Button>
        </Box>
      </Box>
    </Container>
  );
}

export default App;
