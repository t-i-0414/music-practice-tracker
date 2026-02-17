import tracer from 'dd-trace';

export const Metrics = {
  incrementUserCreated: (): void => {
    tracer.dogstatsd.increment('app.user.created');
  },
  incrementUserDeleted: (): void => {
    tracer.dogstatsd.increment('app.user.deleted');
  },
  incrementUserNameChanged: (): void => {
    tracer.dogstatsd.increment('app.user.name_changed');
  },
  incrementUserStatusChanged: (): void => {
    tracer.dogstatsd.increment('app.user.status_changed');
  },
} as const;
