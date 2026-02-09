import 'nestjs-cls';

declare module 'nestjs-cls' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- interface required for declaration merging with nestjs-cls ClsStore
  interface ClsStore {
    userId?: string;
  }
}
