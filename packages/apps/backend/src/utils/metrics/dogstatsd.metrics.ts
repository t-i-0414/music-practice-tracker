import tracer from 'dd-trace';

export const Metrics = {
  incrementUserCreated: (): void => {
    tracer.dogstatsd.increment('app.user.created');
  },
  incrementUserDeleted: (): void => {
    tracer.dogstatsd.increment('app.user.deleted');
  },
} as const;
