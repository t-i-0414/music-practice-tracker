export type BackendUser = {
  publicId: string;
  firebaseUid: string;
  name: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'BANNED';
  createdAt: string;
  updatedAt: string;
};

export type AuthState =
  | { status: 'initializing' }
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; user: BackendUser };
