import type React from 'react';

import { Redirect, Stack } from 'expo-router';

import { useAuthContext } from '@/features/auth';

const AuthLayout: React.FC = () => {
  const { authState } = useAuthContext();

  if (authState.status === 'authenticated') {
    return <Redirect href='/' />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='sign-up' />
    </Stack>
  );
};

export default AuthLayout;
