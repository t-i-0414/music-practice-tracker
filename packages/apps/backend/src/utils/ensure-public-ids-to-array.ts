export const ensurePublicIdsToArray = (value: unknown): string[] => {
  if (value === null || value === undefined) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(splitCommaString);
  }

  return splitCommaString(value);
};

const splitCommaString = (input: unknown): string[] => {
  if (typeof input !== 'string') {
    return [];
  }

  return input
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};
