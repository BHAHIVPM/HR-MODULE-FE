import { render, screen, fireEvent, within } from '@testing-library/react';
import UserRegistrationPage from './UserRegistrationPage';
import registrationService from '../services/registrationService';
import useCurrentUser from '../../../hooks/useCurrentUser';

// react-router v7 ships ESM-only entry points that CRA's jest (jest 27) cannot
// resolve. The page only needs <Link> for its "not allowed" screen, so a
// minimal stand-in keeps this suite runnable without touching the build config.
jest.mock('react-router-dom', () => {
  const React = require('react');
  return {
    __esModule: true,
    Link: ({ to, children, ...rest }) =>
      React.createElement('a', { href: typeof to === 'string' ? to : '#', ...rest }, children),
  };
});

const mockShowErrorPopup = jest.fn();

jest.mock('../../../context/NotificationContext', () => ({
  __esModule: true,
  useNotification: () => ({
    showSuccess: jest.fn(),
    showErrorPopup: mockShowErrorPopup,
  }),
}));

jest.mock('../../../hooks/useCurrentUser', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../services/registrationService', () => ({
  __esModule: true,
  default: { registerUser: jest.fn() },
}));

const renderPage = () => render(<UserRegistrationPage />);

const userTypeSelect = () => screen.getByLabelText(/user type/i);

// Values actually offered by the dropdown (the shared "" placeholder excluded).
const offeredUserTypes = () =>
  within(userTypeSelect())
    .getAllByRole('option')
    .map((option) => option.value)
    .filter(Boolean);

describe('UserRegistrationPage User Type dropdown follows the logged-in user', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('a DEVELOPER login only offers SUPERADMIN', () => {
    useCurrentUser.mockReturnValue({ currentUserType: 'DEVELOPER' });
    renderPage();

    expect(offeredUserTypes()).toEqual(['SUPERADMIN']);
    expect(userTypeSelect().value).toBe('SUPERADMIN');
  });

  test('a SUPERADMIN login only offers ADMIN', () => {
    useCurrentUser.mockReturnValue({ currentUserType: 'SUPERADMIN' });
    renderPage();

    expect(offeredUserTypes()).toEqual(['ADMIN']);
    expect(userTypeSelect().value).toBe('ADMIN');
  });

  test('an ADMIN login only offers USER', () => {
    useCurrentUser.mockReturnValue({ currentUserType: 'ADMIN' });
    renderPage();

    expect(offeredUserTypes()).toEqual(['USER']);
    expect(userTypeSelect().value).toBe('USER');
  });

  test('keeps the standard option list while the login type is unknown', () => {
    useCurrentUser.mockReturnValue({ currentUserType: null });
    renderPage();

    expect(offeredUserTypes()).toEqual(['ADMIN', 'EMPLOYEE', 'USER']);
  });

  test('a login type that may not create users sees no form at all', () => {
    useCurrentUser.mockReturnValue({ currentUserType: 'EMPLOYEE' });
    renderPage();

    expect(screen.getByRole('heading', { name: /not allowed/i })).toBeInTheDocument();
    expect(screen.getByText(/Employee account is not allowed to create user accounts/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/user type/i)).not.toBeInTheDocument();
  });

  test('submitting without a user type is refused before hitting the API', async () => {
    useCurrentUser.mockReturnValue({ currentUserType: 'DEVELOPER' });
    renderPage();

    // The shared select always keeps a "" placeholder option the user can pick.
    fireEvent.change(userTypeSelect(), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /register user/i }));

    expect(mockShowErrorPopup).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Validation Error',
        message: 'Please select a User Type.',
      })
    );
    expect(registrationService.registerUser).not.toHaveBeenCalled();
  });
});
