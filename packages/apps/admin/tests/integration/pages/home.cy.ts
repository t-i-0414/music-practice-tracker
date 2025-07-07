describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('displays the Next.js logo', () => {
    cy.get('img[alt="Next.js logo"]').should('be.visible');
  });

  it('contains getting started text', () => {
    cy.contains('Get started by editing').should('be.visible');
  });

  it('has deploy now link with correct href', () => {
    cy.findByRole('link', { name: /deploy now/i })
      .should('have.attr', 'href')
      .and('include', 'vercel.com/new');
  });

  it('has read docs link with correct href', () => {
    cy.findByRole('link', { name: /read our docs/i })
      .should('have.attr', 'href')
      .and('include', 'nextjs.org/docs');
  });

  it('displays footer links', () => {
    cy.findByRole('link', { name: /learn/i }).should('be.visible');
    cy.findByRole('link', { name: /examples/i }).should('be.visible');
    cy.findByRole('link', { name: /go to nextjs.org/i }).should('be.visible');
  });
});
