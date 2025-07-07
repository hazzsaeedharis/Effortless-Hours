# Effortless Hours

Effortless Hours is a smart time-tracking tool designed to eliminate the frustration of logging work hours in legacy ERP systems. With an intuitive, user-friendly interface inspired by Steve Jobs' design philosophy, this application allows users to input their work logs in natural language, which are then automatically parsed and structured for easy export.

## The Problem

In many companies, especially in Germany, employees are required to manually log their work hours in outdated and clunky ERP systems. This process is often tedious, time-consuming, and prone to errors, leading to frustration and lost productivity.

## The Solution

Effortless Hours streamlines this entire process with a modern, efficient, and elegant solution. The application provides a simple, intuitive interface where users can:

- **Select their project and task.**
- **Paste their work logs in natural language.**
- **Review the parsed and structured data.**
- **Export the data for easy import into their ERP system.**

This approach not only saves time but also reduces the cognitive load on employees, allowing them to focus on what they do best.

## Key Features

- **Natural Language Processing:** The backend is powered by a sophisticated parser that can understand and process unstructured text, automatically identifying key information such as dates, times, and task descriptions.
- **Intuitive UI:** The frontend is built with React and Material-UI, providing a clean, modern, and responsive user experience.
- **Streamlined Workflow:** The application guides the user through a simple, step-by-step process, making time logging faster and more efficient.
- **Dark Mode:** For those late-night work sessions, the application includes a sleek dark mode.

## Tech Stack

- **Frontend:** React, TypeScript, Material-UI, Axios
- **Backend:** Python, FastAPI, Pandas
- **Testing:** Vitest, Playwright

## Getting Started

To get started with Effortless Hours, follow these simple steps:

1. **Clone the repository:**
   ```
   git clone https://github.com/hazzsaeedharis/PDM.git
   ```
2. **Install backend dependencies:**
   ```
   cd backend
   pip install -r requirements.txt
   ```
3. **Install frontend dependencies:**
   ```
   cd ../frontend
   npm install
   ```
4. **Run the backend server:**
   ```
   cd ../backend
   uvicorn main:app --reload
   ```
5. **Run the frontend development server:**
   ```
   cd ../frontend
   npm run dev
   ```

## Future Enhancements

- **iCalendar (.ics) / Google Calendar Integration:** Allow users to import their calendar events directly into the application.
- **Direct ERP Integration:** Connect directly to ERP systems via their APIs to automate the entire time-logging process.
- **AI-Powered Suggestions:** Use machine learning to provide intelligent suggestions and automate task selection.
