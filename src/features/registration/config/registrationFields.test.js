import {
  buildUserRegistrationFields,
  getAllowedCreatableUserTypes,
  getUserTypeLabel,
} from './registrationFields';

const userTypeField = (currentUserType) =>
  buildUserRegistrationFields(currentUserType).find((field) => field.name === 'userType');

const offeredUserTypes = (currentUserType) =>
  userTypeField(currentUserType).options.map((option) => option.value);

describe('user creation hierarchy (User Type dropdown follows the login)', () => {
  test('a DEVELOPER login may only create SUPERADMIN users', () => {
    expect(offeredUserTypes('DEVELOPER')).toEqual(['SUPERADMIN']);
    expect(userTypeField('DEVELOPER').defaultValue).toBe('SUPERADMIN');
  });

  test('a SUPERADMIN login may only create ADMIN users', () => {
    expect(offeredUserTypes('SUPERADMIN')).toEqual(['ADMIN']);
    expect(userTypeField('SUPERADMIN').defaultValue).toBe('ADMIN');
  });

  test('an ADMIN login may only create USER users', () => {
    expect(offeredUserTypes('ADMIN')).toEqual(['USER']);
    expect(userTypeField('ADMIN').defaultValue).toBe('USER');
  });

  test('normalises the login user type (case and surrounding spaces)', () => {
    expect(offeredUserTypes('  superadmin ')).toEqual(['ADMIN']);
    expect(offeredUserTypes('developer')).toEqual(['SUPERADMIN']);
  });

  test('keeps the standard option list while the login type is unknown', () => {
    // e.g. the /auth/about-me profile has not resolved yet, or a dev-bypass session.
    expect(getAllowedCreatableUserTypes(null)).toBeNull();
    expect(getAllowedCreatableUserTypes(undefined)).toBeNull();
    expect(getAllowedCreatableUserTypes('')).toBeNull();
    expect(offeredUserTypes(null)).toEqual(['ADMIN', 'EMPLOYEE', 'USER']);
  });

  test('a login type without a mapping may create nothing', () => {
    expect(getAllowedCreatableUserTypes('EMPLOYEE')).toEqual([]);
    expect(getAllowedCreatableUserTypes('USER')).toEqual([]);
    expect(offeredUserTypes('EMPLOYEE')).toEqual([]);
    expect(userTypeField('EMPLOYEE').defaultValue).toBe('');
  });

  test('options carry human readable labels', () => {
    expect(userTypeField('SUPERADMIN').options).toEqual([{ value: 'ADMIN', label: 'Admin' }]);
    expect(getUserTypeLabel('DEVELOPER')).toBe('Developer');
    expect(getUserTypeLabel('SOMETHING_ELSE')).toBe('SOMETHING_ELSE');
  });

  test('the remaining registration fields are unchanged', () => {
    expect(buildUserRegistrationFields('ADMIN').map((field) => field.name)).toEqual([
      'name',
      'userMail',
      'mobileNo',
      'userType',
      'status',
    ]);
    expect(buildUserRegistrationFields('ADMIN').find((field) => field.name === 'status').options).toEqual([
      { value: 'ACTIVE', label: 'Active' },
      { value: 'INACTIVE', label: 'Inactive' },
    ]);
  });
});
