import { render, screen, fireEvent } from '@testing-library/react';
import TextInputComponent from './TextInputComponent';

test('Process Text button is disabled when input is empty and enabled when input is present', () => {
  const mockOnProcess = jest.fn();
  render(<TextInputComponent onProcess={mockOnProcess} />);
  const button = screen.getByRole('button', { name: /process text/i });
  expect(button).toBeDisabled();
  const textarea = screen.getByLabelText(/paste your time log here/i);
  fireEvent.change(textarea, { target: { value: 'Some text' } });
  expect(button).not.toBeDisabled();
}); 