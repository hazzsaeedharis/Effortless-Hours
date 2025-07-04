import { useState } from 'react';
import { Container, Typography, Box, Alert, Stepper, Step, StepLabel, Button, Paper, Card, CardContent, Fade, Slide, IconButton } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import TextInputComponent from './components/TextInputComponent';
import ResultsTableComponent from './components/ResultsTableComponent';
import ProjectSelectorComponent from './components/ProjectSelectorComponent';
import TaskSelectorComponent from './components/TaskSelectorComponent';
import axios from 'axios';
import appendix2 from './assets/appendix2.json';
import SearchIcon from '@mui/icons-material/Search';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';

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
  const [darkMode, setDarkMode] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ open: boolean; message: string; type: 'success' | 'error' }>({ open: false, message: '', type: 'success' });
  const [selectedTaskPath, setSelectedTaskPath] = useState<string[] | null>(null);

  // Project/task data from appendix2.json
  const projects: Project[] = (appendix2 as any).projects;
  const tasks: Task[] = selectedProject ? projects.find((p: Project) => p.id === selectedProject)?.Tasks || [] : [];

  // Filtered tasks for search
  function filterTasks(tasks: Task[], query: string): Task[] {
    if (!query) return tasks;
    return tasks
      .map((task) => {
        if (task.name.toLowerCase().includes(query.toLowerCase())) return task;
        if (task.subtasks) {
          const filtered = filterTasks(task.subtasks, query);
          if (filtered.length > 0) return { ...task, subtasks: filtered };
        }
        return null;
      })
      .filter(Boolean) as Task[];
  }
  const filteredTasks = filterTasks(tasks, search);

  const handleProjectSelect = (projectId: number) => {
    setSelectedProject(projectId);
    setSelectedTask(null);
    setActiveStep(1);
  };
  const handleTaskSelect = (taskPath: string[]) => {
    setSelectedTaskPath(taskPath);
    setSelectedTask(taskPath[taskPath.length - 1]);
    setActiveStep(2);
  };
  const handleProcessText = async (text: string) => {
    setLogText(text);
    setError(null);
    try {
      const response = await axios.post(
        `${API_URL}/api/v1/parse-text`,
        { text, taskPath: selectedTaskPath ? selectedTaskPath.join(' > ') : '' },
      );
      setResults(response.data.data);
      setActiveStep(3);
      showToast('Time log processed successfully!');
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

  // Toast handler
  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ open: true, message, type });

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100vw', height: '100vh' }}>
          <Container maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 0 }}>
            <Box sx={{ my: 4, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, width: '100%' }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ textShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
                  PDM Hour Logging Tool
                </Typography>
                <IconButton sx={{ ml: 2 }} onClick={() => setDarkMode((prev) => !prev)} color="inherit">
                  {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Box>
              <Paper elevation={3} sx={{ p: 3, mb: 3, width: '100%', borderRadius: 6, boxShadow: 6, backdropFilter: 'blur(16px)', background: 'rgba(255,255,255,0.7)' }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                  {steps.map((label, idx) => (
                    <Step key={label} completed={idx < activeStep}>
                      <StepLabel icon={<Avatar sx={{ bgcolor: idx < activeStep ? '#0071e3' : '#e0e0e0', color: idx < activeStep ? '#fff' : '#222', width: 32, height: 32, fontWeight: 700 }}>{idx + 1}</Avatar>}>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Paper>
              {/* Chat bubble UI for each step */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', minHeight: 300, width: '100%' }}>
                {activeStep === 0 && (
                  <Slide direction="up" in={true} mountOnEnter unmountOnExit>
                    <Card sx={{ maxWidth: 500, borderRadius: 6, boxShadow: 6, mx: 'auto', p: 2, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)' }}>
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
                    <Card sx={{ maxWidth: 500, borderRadius: 6, boxShadow: 6, alignSelf: 'flex-end', mx: 'auto', p: 2, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)' }}>
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
                  <Slide direction="up" in={true} mountOnEnter unmountOnExit>
                    <Card sx={{ maxWidth: 500, borderRadius: 6, boxShadow: 6, mx: 'auto', p: 2, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)' }}>
                      <CardContent>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          📝 Paste your time log below. Make sure your task selection is correct.
                        </Typography>
                        {selectedTaskPath && (
                          <Typography variant="subtitle2" sx={{ mb: 1, color: '#0071e3', fontWeight: 600 }}>
                            Selected Task Path: {selectedTaskPath.join(' > ')}
                          </Typography>
                        )}
                        <TextInputComponent onProcess={handleProcessText} />
                      </CardContent>
                    </Card>
                  </Slide>
                )}
                {activeStep === 3 && (
                  <Fade in={true} timeout={600}>
                    <Box sx={{ width: '100%' }}>
                      <ResultsTableComponent results={results} showToast={showToast} />
                    </Box>
                  </Fade>
                )}
              </Box>
              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button variant="outlined" sx={{ borderRadius: 3, px: 4, py: 1, fontWeight: 600, borderColor: '#0071e3', color: '#0071e3', transition: 'all 0.2s', '&:hover': { borderColor: '#005bb5', background: '#f0f6ff', transform: 'scale(1.04)' }, '&:active': { transform: 'scale(0.98)' } }} onClick={handleReset}>Start Over</Button>
                <Button variant="outlined" sx={{ borderRadius: 3, px: 4, py: 1, fontWeight: 600, borderColor: '#0071e3', color: '#0071e3', transition: 'all 0.2s', '&:hover': { borderColor: '#005bb5', background: '#f0f6ff', transform: 'scale(1.04)' }, '&:active': { transform: 'scale(0.98)' } }} onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))} disabled={activeStep === 0}>Back</Button>
              </Box>
            </Box>
            <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
              <MuiAlert elevation={6} variant="filled" onClose={() => setToast({ ...toast, open: false })} severity={toast.type} sx={{ fontWeight: 600, fontSize: 16, borderRadius: 3 }}>
                {toast.message}
              </MuiAlert>
            </Snackbar>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
