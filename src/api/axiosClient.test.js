import axiosClient from './axiosClient';

/**
 * The project's universal API envelope:
 * { header, message, responseOutput, statusCode }
 * is returned by EVERY backend endpoint - including errors - with HTTP 200.
 * The axios response interceptor must reject any envelope whose embedded
 * statusCode is >= 400 so every catch block renders the manual-close error
 * modal, while normal success envelopes pass through untouched.
 */
const getFulfilledHandler = () => {
  const handler = axiosClient.interceptors.response.handlers[0];
  if (!handler || typeof handler.fulfilled !== 'function') {
    throw new Error('Response interceptor is not registered on axiosClient');
  }
  return handler.fulfilled;
};

const makeResponse = (data) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
});

describe('axiosClient universal envelope error handling', () => {
  test('resolves normal success envelopes untouched', () => {
    const res = makeResponse({
      header: 'Success',
      message: 'User updated successfully.',
      responseOutput: null,
      statusCode: 200,
    });
    expect(getFulfilledHandler()(res)).toBe(res);
  });

  test('rejects HTTP-200 responses whose envelope statusCode is an error', async () => {
    const res = makeResponse({
      header: 'Duplicate entry',
      message: 'Email or mobile number already exists.',
      responseOutput: null,
      statusCode: 409,
    });

    await expect(getFulfilledHandler()(res)).rejects.toMatchObject({
      message: 'Email or mobile number already exists.',
      isProjectEnvelopeError: true,
      response: {
        status: 409,
        statusText: 'Duplicate entry',
        data: res.data,
      },
    });
  });

  test('passes through payloads without a numeric statusCode', () => {
    const res = makeResponse({ some: 'payload' });
    expect(getFulfilledHandler()(res)).toBe(res);
  });

  test('passes through plain Spring Boot error bodies (real HTTP status handles them)', () => {
    const res = makeResponse({
      timestamp: '2026-09-22T10:00:00.000+00:00',
      status: 500,
      error: 'Internal Server Error',
    });
    expect(getFulfilledHandler()(res)).toBe(res);
  });

  test('passes through array payloads', () => {
    const res = makeResponse([{ id: 1 }]);
    expect(getFulfilledHandler()(res)).toBe(res);
  });

  test('rejects envelope errors even when statusCode is a string', async () => {
    const res = makeResponse({
      header: 'Validation failed',
      message: 'Mobile number must be 10 digits.',
      responseOutput: null,
      statusCode: '400',
    });

    await expect(getFulfilledHandler()(res)).rejects.toMatchObject({
      response: { status: 400 },
    });
  });

  test('envelope error also dispatches the generic hr-api-error event', async () => {
    const dispatchSpy = jest.spyOn(window, 'dispatchEvent');
    const res = makeResponse({
      header: 'Duplicate entry',
      message: 'Email or mobile number already exists.',
      responseOutput: null,
      statusCode: 409,
    });

    await expect(getFulfilledHandler()(res)).rejects.toBeTruthy();

    const event = dispatchSpy.mock.calls
      .map(([e]) => e)
      .find((e) => e.type === 'hr-api-error');
    expect(event).toBeTruthy();
    expect(event.detail).toMatchObject({
      title: 'Duplicate entry',
      message: 'Email or mobile number already exists.',
      statusCode: 409,
    });
    dispatchSpy.mockRestore();
  });

  test('successful mutation (POST) dispatches the generic hr-api-success event', () => {
    const dispatchSpy = jest.spyOn(window, 'dispatchEvent');
    const res = makeResponse({
      header: 'Success',
      message: 'Employee saved successfully.',
      responseOutput: null,
      statusCode: 200,
    });
    res.config = { method: 'post', url: '/employee/save' };

    expect(getFulfilledHandler()(res)).toBe(res);

    const event = dispatchSpy.mock.calls
      .map(([e]) => e)
      .find((e) => e.type === 'hr-api-success');
    expect(event).toBeTruthy();
    expect(event.detail).toEqual({
      header: 'Success',
      message: 'Employee saved successfully.',
    });
    dispatchSpy.mockRestore();
  });

  test('successful GET does not dispatch a success toast event', () => {
    const dispatchSpy = jest.spyOn(window, 'dispatchEvent');
    const res = makeResponse({
      header: 'Success',
      message: 'Fetched.',
      responseOutput: [{ id: 1 }],
      statusCode: 200,
    });
    res.config = { method: 'get', url: '/employee/all' };

    expect(getFulfilledHandler()(res)).toBe(res);

    const successEvent = dispatchSpy.mock.calls
      .map(([e]) => e)
      .find((e) => e.type === 'hr-api-success');
    expect(successEvent).toBeFalsy();
    dispatchSpy.mockRestore();
  });

  test('auth endpoints are excluded from the generic success toast', () => {
    const dispatchSpy = jest.spyOn(window, 'dispatchEvent');
    const res = makeResponse({ message: 'Logged in' });
    res.config = { method: 'post', url: '/auth/login' };

    expect(getFulfilledHandler()(res)).toBe(res);

    const successEvent = dispatchSpy.mock.calls
      .map(([e]) => e)
      .find((e) => e.type === 'hr-api-success');
    expect(successEvent).toBeFalsy();
    dispatchSpy.mockRestore();
  });
});
