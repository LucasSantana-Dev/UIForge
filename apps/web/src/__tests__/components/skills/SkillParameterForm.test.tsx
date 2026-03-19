/**
 * SkillParameterForm Component Tests
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SkillParameterForm } from '@/components/skills/SkillParameterForm';

describe('SkillParameterForm', () => {
  it('renders nothing when schema has no properties', () => {
    const { container } = render(
      <SkillParameterForm schema={{ type: 'object' }} values={{}} onChange={jest.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when properties is empty', () => {
    const { container } = render(
      <SkillParameterForm
        schema={{ type: 'object', properties: {} }}
        values={{}}
        onChange={jest.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders a text input for a string property', () => {
    const schema = { type: 'object', properties: { username: { type: 'string' } } };
    render(<SkillParameterForm schema={schema} values={{}} onChange={jest.fn()} />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders a select for an enum property', () => {
    const schema = {
      type: 'object',
      properties: { color: { type: 'string', enum: ['red', 'blue', 'green'] } },
    };
    render(<SkillParameterForm schema={schema} values={{}} onChange={jest.fn()} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('red')).toBeInTheDocument();
    expect(screen.getByText('blue')).toBeInTheDocument();
  });

  it('renders a checkbox for a boolean property', () => {
    const schema = { type: 'object', properties: { active: { type: 'boolean' } } };
    render(<SkillParameterForm schema={schema} values={{}} onChange={jest.fn()} />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('calls onChange when text input changes', async () => {
    const onChange = jest.fn();
    const schema = { type: 'object', properties: { name: { type: 'string' } } };
    render(<SkillParameterForm schema={schema} values={{}} onChange={onChange} />);
    await userEvent.type(screen.getByRole('textbox'), 'hello');
    expect(onChange).toHaveBeenCalled();
  });

  it('calls onChange when select changes', async () => {
    const onChange = jest.fn();
    const schema = {
      type: 'object',
      properties: { size: { type: 'string', enum: ['sm', 'md', 'lg'] } },
    };
    render(<SkillParameterForm schema={schema} values={{}} onChange={onChange} />);
    await userEvent.selectOptions(screen.getByRole('combobox'), 'md');
    expect(onChange).toHaveBeenCalledWith({ size: 'md' });
  });

  it('calls onChange when checkbox changes', async () => {
    const onChange = jest.fn();
    const schema = { type: 'object', properties: { enabled: { type: 'boolean' } } };
    render(<SkillParameterForm schema={schema} values={{ enabled: false }} onChange={onChange} />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith({ enabled: true });
  });

  it('shows description hint for a property', () => {
    const schema = {
      type: 'object',
      properties: { width: { type: 'string', description: 'Width in px' } },
    };
    render(<SkillParameterForm schema={schema} values={{}} onChange={jest.fn()} />);
    expect(screen.getByText(/Width in px/)).toBeInTheDocument();
  });
});
