import { TestingHttpClient } from './testing-app.helper';

export const createUserViaApi = async (params: {
  httpClient: TestingHttpClient;
  token: string;
  firebaseUid: string;
  name: string;
}): Promise<string> => {
  const response = await params.httpClient
    .post('/api/users')
    .set('Authorization', `Bearer ${params.token}`)
    .send({ firebaseUid: params.firebaseUid, name: params.name });

  return response.body.publicId as string;
};
