# Contributing Guidelines

## Development Setup

1. **Clone and Install**
```bash
git clone <repository-url>
cd react-mcp
npm install
```

2. **Development Mode**
```bash
npm run dev
```

## Development Workflow

### 1. Make Changes
- Edit `server.ts` for core logic
- Edit `index.ts` for runtime behavior
- Edit pattern definitions in `PATTERNS` object

### 2. Verify Changes
```bash
npm run lint         # ESLint check
npm run typecheck    # TypeScript validation
npm run format       # Prettier check
npm run test         # Run tests
npm run build        # Compile TypeScript
```

### 3. Run All Checks
```bash
npm run lint && npm run typecheck && npm run test && npm run build
```

## Adding New Patterns

1. **Define Pattern Structure**
```typescript
mypattern: {
  label: "My Pattern",
  directories: [
    "src/feature1",
    "src/feature2"
  ],
  files: [
    { 
      path: "src/feature1/index.ts", 
      content: "export {};\n" 
    },
    {
      path: "package.json",
      content: JSON.stringify({
        name: "my-pattern-app",
        // ... full package.json
      }, null, 2)
    }
    // ... more files
  ]
}
```

2. **Update Type Union**
```typescript
export type PatternType = "layered" | "feature" | "atomic" | "clean" | "mypattern";
```

3. **Update Schema**
```typescript
const PatternTypeSchema = z.enum(["layered", "feature", "atomic", "clean", "mypattern"]);
```

4. **Add Tests**
```typescript
describe("scaffoldProject - My Pattern", () => {
  // ... test cases
});
```

## Testing Guidelines

### Unit Tests
- Test all security validations
- Test directory creation
- Test file generation
- Test error handling
- Test all patterns

### Test Structure
```typescript
import { describe, expect, it, beforeEach, afterEach } from "vitest";

describe("Feature Name", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await createTempDir();
  });

  afterEach(async () => {
    await cleanupDir(tempDir);
  });

  it("should do something", async () => {
    // ... test logic
  });
});
```

## Code Style

### TypeScript
- Use strict mode
- No `any` types
- Explicit return types for exported functions
- Use `const` by default

### Error Handling
- Throw descriptive errors
- Include context in error messages
- Use type guards for error types

### Documentation
- JSDoc for all exported functions
- Inline comments for complex logic
- Keep README updated

## Pull Request Process

1. **Before Submitting**
   - ✅ All tests pass
   - ✅ No linting errors
   - ✅ Code is formatted
   - ✅ TypeScript compiles
   - ✅ Documentation updated

2. **PR Description**
   - Describe what changed
   - Explain why
   - Link to related issues
   - Include screenshots if UI-related

3. **Review Process**
   - Address review comments
   - Keep commits clean
   - Rebase if needed

## Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Run full test suite
4. Build: `npm run build`
5. Tag release: `git tag v1.0.1`
6. Push: `git push --tags`
7. Publish: `npm publish` (if publishing to npm)

## Support

For questions or issues:
1. Check existing documentation
2. Search closed issues
3. Open a new issue with:
   - Environment details
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages

## Code of Conduct

- Be respectful
- Be constructive
- Focus on code quality
- Help others learn
