import { render, screen } from '@testing-library/react';
import ResultsTableComponent from './ResultsTableComponent';

const mockResults = [
  {
    employee: 'John Doe',
    date: '1 April, 2025',
    start_time: '9:00',
    end_time: '12:00',
    description: 'Test Task',
    status: 'Unverified',
  },
];

test('renders table with data', () => {
  render(<ResultsTableComponent results={mockResults} />);
  expect(screen.getByText('John Doe')).toBeInTheDocument();
  expect(screen.getByText('Test Task')).toBeInTheDocument();
  expect(screen.getByText('Unverified')).toBeInTheDocument();
}); 