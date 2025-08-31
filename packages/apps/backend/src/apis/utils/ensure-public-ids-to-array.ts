export const ensurePublicIdsToArray = (value: string | string[] | undefined | null): string[] => {
  if (value === null || value === undefined) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(splitCommaString);
  }

  return splitCommaString(value);
};

const splitCommaString = (input: string): string[] =>
  input
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
