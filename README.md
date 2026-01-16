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

### Cursor IDE (Recommended)

#### Step 1: Build the MCP Server

```bash
cd C:\path\to\react-mcp
npm install
npm run build
```

#### Step 2: Configure Cursor

1. **Open Cursor Settings**:
   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
   - Type "Preferences: Open User Settings (JSON)"
   - Or go to: `File` → `Preferences` → `Settings` → Click the `{}` icon (top right)

2. **Add MCP Configuration**:

Add this to your Cursor `settings.json`:

```json
{
  "mcp.servers": {
    "react-architecture-scaffolder": {
      "command": "node",
      "args": [
        "C:\\Users\\YOUR_USERNAME\\workspace\\react-mcp\\dist\\index.js"
      ],
      "env": {},
      "disabled": false
    }
  }
}
```

**Important**: Replace `YOUR_USERNAME` with your actual Windows username!

#### Step 3: Restart Cursor

Close and reopen Cursor to load the MCP server.

#### Step 4: Verify Installation

1. Open Cursor Composer (chat)
2. Type: "describe all architectures"
3. If configured correctly, you'll see all 4 architecture patterns!

---

### Alternative: Development Mode (For Testing Changes)

If you're actively developing the MCP server:

```json
{
  "mcp.servers": {
    "react-architecture-scaffolder": {
      "command": "npx",
      "args": [
        "tsx",
        "C:\\Users\\YOUR_USERNAME\\workspace\\react-mcp\\index.ts"
      ],
      "env": {},
      "disabled": false
    }
  }
}
```

**Note**: Development mode runs TypeScript directly (no build needed), but it's slower.

---

### Claude Desktop

For Claude Desktop, add to `claude_desktop_config.json`:

**Location**:
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

**Configuration**:

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

Restart Claude Desktop after configuration.

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

## Usage Examples

### In Cursor Composer

Once configured, you can use natural language to scaffold projects:

**Example 1: Create a Layered project**
```
Create a layered React project named my-app
```

**Example 2: Create a Feature-Based project**
```
Create a feature-based project called dashboard-app
```

**Example 3: Get architecture info**
```
Describe all four architecture patterns
```

**Example 4: Create in parent directory**
```
Create a project in layered architecture with name ../my-project
```

### Common Commands

```bash
# After scaffolding, navigate to your project
cd my-project

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure Generated

Each scaffolded project includes:

- ✅ **TypeScript** configured with strict mode
- ✅ **Vite** for fast development and building
- ✅ **ESLint** with React rules
- ✅ **Testing** setup (Vitest + Testing Library)
- ✅ **CI/CD** pipeline (GitHub Actions)
- ✅ **Docker** configuration for deployment
- ✅ **Production-ready** folder structure
- ✅ **Environment** configuration
- ✅ **API client** setup (axios)
- ✅ **State management** structure

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

## Troubleshooting

### MCP Server Not Working in Cursor

**Problem**: Cursor doesn't recognize the MCP server

**Solutions**:

1. **Verify build**:
   ```bash
   cd C:\path\to\react-mcp
   npm run build
   ```
   Make sure `dist/index.js` exists.

2. **Check path in settings.json**:
   - Path must use double backslashes: `C:\\Users\\...`
   - Or use forward slashes: `C:/Users/...`
   - Verify the file actually exists at that location

3. **Restart Cursor completely**:
   - Close all Cursor windows
   - Reopen Cursor
   - Wait 5-10 seconds for MCP to initialize

4. **Check Cursor logs**:
   - Open Developer Tools: `Ctrl+Shift+I`
   - Look for MCP-related errors in Console

5. **Verify Node.js version**:
   ```bash
   node --version  # Should be 18.x or higher
   ```

### Creating Projects Fails

**Problem**: Project creation fails or creates old structure

**Solution**:
1. Rebuild the MCP server: `npm run build`
2. Restart Cursor completely
3. Try creating the project again

### Permission Errors

**Problem**: "Access denied" when creating files

**Solution**:
- Ensure you have write permissions in the target directory
- Try creating in a different location
- Run Cursor as Administrator (not recommended, but works)

## License

MIT

## Contributing

1. Follow the existing code style (Prettier + ESLint)
2. Add tests for new features
3. Ensure all tests pass: `npm run lint && npm run typecheck && npm test`
4. Update documentation as needed
