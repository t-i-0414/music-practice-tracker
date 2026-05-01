import auth from '@react-native-firebase/auth';
import Constants from 'expo-constants';

import type { BackendUser } from '../types';

const MIN_URL_LENGTH = 1;
const DEFAULT_API_URL = 'http://localhost:3000';

const getApiUrl = (): string => {
  const url: unknown = Constants.expoConfig?.extra?.apiUrl;
  if (typeof url === 'string' && url.length >= MIN_URL_LENGTH) return url;
  return DEFAULT_API_URL;
};

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const { currentUser } = auth();
  if (currentUser === null) throw new Error('No authenticated Firebase user');

  const token = await currentUser.getIdToken();
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Response.json() returns `any` per DOM lib; API contract guarantees shape
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/consistent-type-assertions -- typed API response
const parseJsonResponse = async <T>(response: Response): Promise<T> => (await response.json()) as T;

export const fetchCurrentUser = async (): Promise<BackendUser> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${getApiUrl()}/api/users/me`, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch current user: ${response.status}`);
  }

  return parseJsonResponse<BackendUser>(response);
};

export const createUser = async (name: string): Promise<BackendUser> => {
  const { currentUser } = auth();
  if (currentUser === null) throw new Error('No authenticated Firebase user');

  const headers = await getAuthHeaders();
  const response = await fetch(`${getApiUrl()}/api/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      firebaseUid: currentUser.uid,
      name,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create user: ${response.status}`);
  }

  return parseJsonResponse<BackendUser>(response);
};
