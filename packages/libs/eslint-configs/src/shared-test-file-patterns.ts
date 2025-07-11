const extensions = ['ts', 'tsx', 'mts', 'cts', 'js', 'jsx', 'mjs', 'cjs'];
export const testFilePatterns = ({ prefix = '' } = {}): string[] =>
  extensions.flatMap((ext) => [
    `${prefix === '' ? `${prefix}/` : ''}**/*.spec.${ext}`,
    `${prefix === '' ? `${prefix}/` : ''}**/*.test.${ext}`,
    `${prefix === '' ? `${prefix}/` : ''}**/specs.${ext}`,
    `${prefix === '' ? `${prefix}/` : ''}**/test.${ext}`,
  ]);
