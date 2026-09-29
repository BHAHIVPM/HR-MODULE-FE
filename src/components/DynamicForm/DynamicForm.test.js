import { render, screen, fireEvent } from '@testing-library/react';
import DynamicForm from './DynamicForm';

const buildFields = (userTypeOptions, defaultValue) => [
  { name: 'name', label: 'Full Name', type: 'text' },
  {
    name: 'userType',
    label: 'User Type',
    type: 'select',
    defaultValue,
    options: userTypeOptions.map((value) => ({ value, label: value })),
  },
];

describe('DynamicForm keeps select values valid when the field config changes', () => {
  test('falls back to the new default when the selected option disappears', () => {
    const { rerender } = render(
      <DynamicForm
        fields={buildFields(['ADMIN', 'EMPLOYEE', 'USER'], 'USER')}
        onSubmit={() => {}}
      />
    );
    expect(screen.getByLabelText(/user type/i).value).toBe('USER');

    // e.g. the logged-in profile resolved and only SUPERADMIN may be created now.
    rerender(
      <DynamicForm fields={buildFields(['SUPERADMIN'], 'SUPERADMIN')} onSubmit={() => {}} />
    );

    expect(screen.getByLabelText(/user type/i).value).toBe('SUPERADMIN');
  });

  test('keeps a still-offered selection and never drops typed input', () => {
    const { rerender } = render(
      <DynamicForm fields={buildFields(['ADMIN', 'USER'], 'ADMIN')} onSubmit={() => {}} />
    );
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/user type/i), { target: { value: 'USER' } });

    rerender(<DynamicForm fields={buildFields(['ADMIN', 'USER'], 'ADMIN')} onSubmit={() => {}} />);

    expect(screen.getByLabelText(/full name/i).value).toBe('Jane Doe');
    expect(screen.getByLabelText(/user type/i).value).toBe('USER');
  });
});
