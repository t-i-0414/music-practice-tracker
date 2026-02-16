declare const brand: unique symbol;

export type Brand<T, TBrand extends string> = T & { readonly [brand]: TBrand };

export type UserPublicId = Brand<string, 'UserPublicId'>;
export type AdminUserPublicId = Brand<string, 'AdminUserPublicId'>;
export type FirebaseUid = Brand<string, 'FirebaseUid'>;
export type CognitoSub = Brand<string, 'CognitoSub'>;
