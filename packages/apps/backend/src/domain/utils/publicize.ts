/**
 * Strip internal properties to generate a public-facing type.
 */
export type Publicize<T> = Omit<T, 'id'>;
