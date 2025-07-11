describe('sample Test', () => {
  it('should pass a sample test', () => {
    expect.hasAssertions();
    expect(true).toBe(true);
  });

  it('should fail a sample test', () => {
    expect.hasAssertions();
    expect(false).toBe(false);
  });
});
