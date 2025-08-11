# Pre-Commit Checklist

## 🔍 Automated Checks (Required)

Run these commands **before every commit**:

```bash
# Option 1: Run individually
bun run format:fix      # Step 1: Format code
bun run cspell          # Step 2: Check spelling
bun run lint:es:check   # Step 3: Lint code
bun run type:check      # Step 4: Type check

# Option 2: Run all at once
bun run ci:temp
```

✅ **All must pass with zero errors**

## 📋 Manual Review Checklist

Before committing, review your code for:

### Code Quality

- [ ] No `console.log` statements (use proper logging)
- [ ] No commented-out code (delete it)
- [ ] No `any` types (use proper TypeScript types)
- [ ] No hardcoded values (use constants/config)
- [ ] No duplicate code (extract to functions/components)

### Security

- [ ] No secrets/keys/tokens in code
- [ ] No sensitive data in comments
- [ ] Input validation implemented
- [ ] SQL injection prevention (use Prisma properly)
- [ ] XSS prevention (sanitize user input)

### Testing

- [ ] Unit tests written for new functions/methods
- [ ] Integration tests for API endpoints
- [ ] Tests are passing locally
- [ ] Edge cases covered
- [ ] Error cases tested

### Documentation

- [ ] JSDoc for public APIs
- [ ] README updated if needed
- [ ] Component documentation if new component
- [ ] Breaking changes documented
- [ ] Complex logic has comments

### Performance

- [ ] No N+1 queries
- [ ] Proper indexes for new database fields
- [ ] Images optimized
- [ ] Unnecessary re-renders avoided (React)
- [ ] Bundle size impact considered

### Accessibility

- [ ] Semantic HTML used
- [ ] ARIA labels for interactive elements
- [ ] Keyboard navigation works
- [ ] Color contrast is sufficient
- [ ] Focus states visible

## 🎯 Commit Message Format

```bash
type(scope): description

# Types: feat, fix, docs, style, refactor, test, chore
# Scope: backend, admin, mobile, or specific module
```

### Examples

```bash
feat(backend): add practice session CRUD operations
fix(mobile): resolve timer pause state issue
docs(admin): update testing strategy documentation
refactor(backend): optimize user query performance
test(mobile): add unit tests for PracticeTimer
chore(deps): update NestJS to v11.0.2
```

## 🚫 Common Mistakes to Avoid

### TypeScript

```typescript
// ❌ BAD
const data: any = fetchData();

// ✅ GOOD
const data: UserData = fetchData();
```

### Logging

```typescript
// ❌ BAD
console.log('User created:', user);

// ✅ GOOD
logger.info('User created', { userId: user.publicId });
```

### Error Handling

```typescript
// ❌ BAD
try {
  await saveUser(user);
} catch (e) {
  console.error(e);
}

// ✅ GOOD
try {
  await saveUser(user);
} catch (error) {
  logger.error('Failed to save user', {
    error: error.message,
    userId: user.publicId,
  });
  throw new InternalServerErrorException('Failed to save user');
}
```

### React Components

```tsx
// ❌ BAD
<div onClick={handleClick}>Click me</div>

// ✅ GOOD
<button
  onClick={handleClick}
  aria-label="Submit form"
  type="button"
>
  Click me
</button>
```

### Prisma Queries

```typescript
// ❌ BAD
const users = await prisma.user.findMany();
const posts = await prisma.post.findMany({ where: { userId: users[0].id } });

// ✅ GOOD
const users = await prisma.user.findMany({
  include: { posts: true },
});
```

## 🔄 If Checks Fail

### Formatting Issues

```bash
bun run format:fix  # Auto-fix formatting
```

### Spelling Errors

```bash
# If it's a valid technical term, add to .cspell.json
# Otherwise, fix the spelling
```

### Lint Errors

```bash
bun run lint:es:fix  # Try auto-fix first
# Manual fix for remaining issues
```

### Type Errors

```bash
# Fix the types properly, don't use 'any' as a workaround
# If truly needed, use 'unknown' and add type guards
```

### Test Failures

```bash
bun run test -- --watch  # Fix in watch mode
```

## 🎉 Ready to Commit

Once all checks pass:

```bash
git add .
git commit -m "type(scope): description"
git push origin your-branch
```

## 📊 Quick Status Check

Run this to see what needs fixing:

```bash
# Check everything at once
bun run ci:temp

# If something fails, check individually:
bun run format:check    # Formatting issues?
bun run cspell          # Spelling issues?
bun run lint:es:check   # Linting issues?
bun run type:check      # Type issues?
bun run test            # Test issues?
```

## 💡 Pro Tips

1. **Set up your editor** to run these checks on save
2. **Use pre-commit hooks** (already configured with Lefthook)
3. **Fix issues immediately** rather than accumulating tech debt
4. **Ask for help** if you're unsure about a quality issue
5. **Review the diff** before committing (`git diff --staged`)

## 🆘 Need Help?

- Check `/docs/code-quality.md` for detailed standards
- Review existing code for patterns
- Ask team members for code review
- Use Claude Code for assistance (it knows these standards!)

---

**Remember**: Quality checks are not obstacles, they're guardrails that keep our codebase maintainable, secure, and professional. Taking a few extra minutes to ensure quality saves hours of debugging later!
