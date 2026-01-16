# React Architecture Scaffolder MCP Server

A Model Context Protocol (MCP) server that helps developers quickly scaffold React projects with industry-standard architecture patterns.

## Features

- 🏗️ **4 Architecture Patterns**: Layered, Feature-Based, Atomic Design, and Clean Architecture
- 🔒 **Secure**: Path validation prevents directory traversal attacks
- ✅ **Type-Safe**: Full TypeScript with strict mode and Zod validation
- 🧪 **Tested**: Comprehensive unit test coverage
- 📦 **Production-Ready**: Follows enterprise-grade standards

## Architecture Patterns

### 1. Layered (Standard)

Best for small apps and prototypes.

```
/components
/hooks
/services
/pages
/styles
/utils
```

### 2. Feature-Based (Modular)

Best for medium-to-large apps with multiple domains.

```
/features/auth
/features/dashboard
/shared
```

### 3. Atomic Design

Best for design-system heavy products.

```
/atoms
/molecules
/organisms
/templates
/pages
```

### 4. Clean Architecture (MVVM/Hexagonal)

Best for enterprise apps with complex business logic.

```
/domain (entities, usecases)
/data (repositories, api)
/presentation (components, viewmodels)
```

## Installation

```bash
npm install
npm run build
```

## Configuration

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "react-architecture-scaffolder": {
      "command": "node",
      "args": ["C:\\path\\to\\react-mcp\\dist\\index.js"]
    }
  }
}
```

### Development Mode

```json
{
  "mcpServers": {
    "react-architecture-scaffolder": {
      "command": "npx",
      "args": ["tsx", "C:\\path\\to\\react-mcp\\index.ts"]
    }
  }
}
```

## Tools

### `describe_architectures`

Returns a detailed comparison of all architecture patterns.

**Input**: None

**Output**: Text description of all patterns with pros/cons.

### `scaffold_react_project`

Creates a React project with the specified architecture pattern.

**Input**:

```typescript
{
  path: string; // Target directory (relative or absolute)
  pattern_type: 'layered' | 'feature' | 'atomic' | 'clean';
}
```

**Output**: Summary of created directories and files.

## Development

### Scripts

```bash
npm run dev          # Run in development mode
npm run build        # Build for production
npm run lint         # Lint code
npm run typecheck    # Type check
npm run test         # Run tests
npm run format       # Format code
```

### Testing

```bash
npm test
```

Tests include:

- Path validation security checks
- Scaffolding for all patterns
- Error handling
- File/directory creation

## Security

- **Path Traversal Protection**: All paths are validated to prevent escaping the working directory
- **Safe File Creation**: Uses `wx` flag to prevent overwriting existing files
- **Input Validation**: Zod schemas validate all tool inputs
- **No Secrets**: No API keys or secrets in code

## License

MIT

## Contributing

1. Follow the existing code style (Prettier + ESLint)
2. Add tests for new features
3. Ensure all tests pass: `npm run lint && npm run typecheck && npm test`
4. Update documentation as needed
