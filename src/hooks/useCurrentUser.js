import { useCallback, useEffect, useState } from 'react';
import authService from '../features/auth/services/authService';
import { useAuth } from '../context/AuthContext';
import { LOGIN_ID_KEY, DEV_AUTH_KEY } from '../api/axiosClient';

/**
 * Resolves the identity of the currently logged-in user so update flows can
 * apply "self-edit protection" (e.g. nobody may change their own userType,
 * no matter if they are SUPERADMIN, ADMIN, EMPLOYEE or USER).
 *
 * Resolution order for the login id:
 *   1. AuthContext `user` (hydrated by GET /auth/about-me)
 *   2. sessionStorage LOGIN_ID_KEY (also covers the dev bypass session)
 *
 * If a real session has no profile loaded yet, the hook fetches
 * /auth/about-me itself and stores the result in the shared AuthContext.
 *
 * Safe to use without an AuthProvider (e.g. in unit tests) - it simply falls
 * back to the sessionStorage login id.
 */
const normalizeId = (value) =>
  value === null || value === undefined ? '' : String(value).trim().toLowerCase();

const readSessionItem = (key) => {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

export default function useCurrentUser() {
  const auth = useAuth();
  const contextUser = auth?.user || null;
  const setUser = auth?.setUser;
  const isAuthenticated = auth?.isAuthenticated;

  const [fetchedUser, setFetchedUser] = useState(null);
  const profileUser = contextUser || fetchedUser;

  const isDevSession = readSessionItem(DEV_AUTH_KEY) === 'true';
  const sessionLoginId = readSessionItem(LOGIN_ID_KEY);

  useEffect(() => {
    // Dev bypass sessions have no about-me profile behind them.
    if (profileUser || isDevSession || isAuthenticated === false) return undefined;
    // The login id is always written to sessionStorage on real logins; without
    // it there is nothing to resolve (e.g. fresh jsdom test environment).
    if (!sessionLoginId) return undefined;
    let cancelled = false;
    authService
      .aboutMe()
      .then((res) => {
        if (cancelled) return;
        const output =
          res?.data?.responseOutput ?? res?.data?.data ?? res?.data ?? null;
        if (output) {
          setFetchedUser(output);
          if (setUser) setUser(output);
        }
      })
      .catch(() => {
        // Profile fetch is non-fatal; the sessionStorage login id is the fallback.
      });
    return () => {
      cancelled = true;
    };
  }, [profileUser, isDevSession, isAuthenticated, sessionLoginId, setUser]);

  const currentLoginId = profileUser?.userId || sessionLoginId || null;
  const currentUserType = profileUser?.userType || null;

  /** True when the given id (userId / loginId) belongs to the logged-in user. */
  const isSelfId = useCallback(
    (value) =>
      Boolean(value) &&
      Boolean(currentLoginId) &&
      normalizeId(value) === normalizeId(currentLoginId),
    [currentLoginId]
  );

  return { currentLoginId, currentUserType, isSelfId, profileLoaded: Boolean(profileUser) };
}
