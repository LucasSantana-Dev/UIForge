import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

jest.mock('@siza/ui', () => ({
  CodeEditor: ({
    code,
    onChange,
    language,
  }: {
    code: string;
    onChange: (code: string) => void;
    language?: string;
    framework?: string;
    componentLibrary?: string;
  }) => (
    <div data-testid="code-editor-stub" data-language={language ?? 'typescript'}>
      <pre>{code}</pre>
      <button onClick={() => onChange('updated code')}>Trigger change</button>
    </div>
  ),
}));

import CodeEditor from '@/components/generator/CodeEditor';

describe('CodeEditor (re-export stub)', () => {
  it('renders without crashing', () => {
    render(<CodeEditor code="" onChange={jest.fn()} />);
    expect(screen.getByTestId('code-editor-stub')).toBeInTheDocument();
  });

  it('displays code content passed via prop', () => {
    const sampleCode = 'export default function App() { return <div/>; }';
    render(<CodeEditor code={sampleCode} onChange={jest.fn()} />);
    expect(screen.getByText(sampleCode)).toBeInTheDocument();
  });

  it('calls onChange when the editor triggers a change', () => {
    const handleChange = jest.fn();
    render(<CodeEditor code="" onChange={handleChange} />);
    fireEvent.click(screen.getByText('Trigger change'));
    expect(handleChange).toHaveBeenCalledWith('updated code');
  });
});
