import fs from 'node:fs/promises';
import path from 'node:path';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

/**
 * Supported React architecture pattern types
 */
export type PatternType = 'layered' | 'feature' | 'atomic' | 'clean';

/**
 * Definition of a scaffolding pattern including directories and files to create
 */
export type PatternDefinition = {
  label: string;
  directories: string[];
  files: Array<{ path: string; content: string }>;
};

/**
 * Result of a scaffolding operation
 */
export type ScaffoldResult = {
  resolvedTarget: string;
  createdDirs: string[];
  createdFiles: string[];
  skippedFiles: string[];
  label: string;
};

const PatternTypeSchema = z.enum(['layered', 'feature', 'atomic', 'clean']);
const ScaffoldInputSchema = z.object({
  path: z.string().min(1),
  pattern_type: PatternTypeSchema,
});

export const ARCHITECTURE_DESCRIPTION = [
  'Layered (Standard):',
  '- Structure: /public, /src/components, /hooks, /services, /pages, /styles, /utils, /assets',
  '- Pros: Simple mental model, minimal ceremony, fast to onboard',
  '- Cons: Feature boundaries are loose; can grow into a monolith',
  '- Best for: Small apps and prototypes',
  '',
  'Feature-Based (Modular):',
  '- Structure: /public, /features/<feature> with internal components/hooks/api, /shared, /assets',
  '- Pros: Clear ownership by feature, scales with teams, easier refactors',
  '- Cons: Requires discipline in shared layers',
  '- Best for: Medium-to-large apps with multiple domains',
  '',
  'Atomic Design:',
  '- Structure: /public, /atoms, /molecules, /organisms, /templates, /pages, /assets',
  '- Pros: Strong design-system alignment, reusable UI building blocks',
  '- Cons: Can feel heavy for logic-heavy domains',
  '- Best for: Design-system heavy products',
  '',
  'Clean Architecture (Backend-Agnostic):',
  '- Structure: /public, /backend (entities/usecases/interfaces), /frontend (components/pages), /shared, /assets',
  '- Pros: Separation of concerns, testable core logic, backend-agnostic, long-term maintainability',
  '- Cons: More boilerplate and concepts to manage',
  '- Best for: Enterprise apps with complex business logic, full-stack applications',
  '- Note: Backend folder structure works with any backend language (.NET, Java, Python, Node.js)',
].join('\n');

export const PATTERNS: Record<PatternType, PatternDefinition> = {
  layered: {
    label: 'Layered (Standard)',
    directories: [
      'public',
      'src/components',
      'src/hooks',
      'src/services',
      'src/pages',
      'src/store',
      'src/styles',
      'src/utils',
      'src/config',
      'src/assets/images',
      'src/assets/icons',
      'src/assets/fonts',
      'tests/unit',
      'tests/integration',
      'tests/e2e',
      '.github/workflows',
    ],
    files: [
      { path: 'src/components/index.ts', content: 'export {};\n' },
      { path: 'src/hooks/index.ts', content: 'export {};\n' },
      { path: 'src/services/index.ts', content: '// API clients and business logic\nexport {};\n' },
      { path: 'src/services/api.ts', content: '// Base API configuration\nimport axios from \'axios\';\n\nconst api = axios.create({\n  baseURL: import.meta.env.VITE_API_URL || \'http://localhost:3000\',\n  timeout: 10000,\n});\n\nexport default api;\n' },
      { path: 'src/pages/index.ts', content: 'export {};\n' },
      { path: 'src/store/index.ts', content: '// Global state management\n// Use Redux Toolkit, Zustand, or Context API\nexport {};\n' },
      { path: 'src/styles/index.ts', content: 'export {};\n' },
      { path: 'src/utils/index.ts', content: 'export {};\n' },
      { path: 'src/config/index.ts', content: '// Environment-based configuration\nexport const config = {\n  apiUrl: import.meta.env.VITE_API_URL || \'http://localhost:3000\',\n  environment: import.meta.env.MODE || \'development\',\n};\n' },
      { path: 'src/assets/images/.gitkeep', content: '' },
      { path: 'src/assets/icons/.gitkeep', content: '' },
      { path: 'src/assets/fonts/.gitkeep', content: '' },
      { path: 'tests/unit/.gitkeep', content: '' },
      { path: 'tests/integration/.gitkeep', content: '' },
      { path: 'tests/e2e/.gitkeep', content: '' },
      { path: 'tests/setup.ts', content: '// Test setup and configuration\nimport { expect, afterEach } from \'vitest\';\nimport { cleanup } from \'@testing-library/react\';\nimport \'@testing-library/jest-dom\';\n\nafterEach(() => {\n  cleanup();\n});\n' },
      {
        path: 'src/types.ts',
        content: '// Shared app types\nexport type AppType = unknown;\n',
      },
      {
        path: 'src/App.tsx',
        content:
          "import React from 'react';\n\nfunction App() {\n  return <div>React App</div>;\n}\n\nexport default App;\n",
      },
      {
        path: 'src/main.tsx',
        content:
          "import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);\n",
      },
      {
        path: 'package.json',
        content: JSON.stringify(
          {
            name: 'react-app-layered',
            version: '0.1.0',
            private: true,
            type: 'module',
            scripts: {
              dev: 'vite',
              build: 'tsc && vite build',
              lint: 'eslint . --ext ts,tsx',
              preview: 'vite preview',
              test: 'vitest',
              'test:coverage': 'vitest --coverage',
            },
            dependencies: {
              react: '^18.3.1',
              'react-dom': '^18.3.1',
              axios: '^1.6.5',
            },
            devDependencies: {
              '@testing-library/jest-dom': '^6.1.5',
              '@testing-library/react': '^14.1.2',
              '@testing-library/user-event': '^14.5.1',
              '@types/react': '^18.3.3',
              '@types/react-dom': '^18.3.0',
              '@typescript-eslint/eslint-plugin': '^7.13.1',
              '@typescript-eslint/parser': '^7.13.1',
              '@vitejs/plugin-react': '^4.3.1',
              '@vitest/coverage-v8': '^1.1.0',
              eslint: '^8.57.0',
              'eslint-plugin-react-hooks': '^4.6.2',
              'eslint-plugin-react-refresh': '^0.4.7',
              jsdom: '^23.0.1',
              typescript: '^5.2.2',
              vite: '^5.3.1',
              vitest: '^1.1.0',
            },
          },
          null,
          2,
        ),
      },
      {
        path: 'tsconfig.json',
        content: JSON.stringify(
          {
            compilerOptions: {
              target: 'ES2020',
              useDefineForClassFields: true,
              lib: ['ES2020', 'DOM', 'DOM.Iterable'],
              module: 'ESNext',
              skipLibCheck: true,
              moduleResolution: 'bundler',
              allowImportingTsExtensions: true,
              resolveJsonModule: true,
              isolatedModules: true,
              noEmit: true,
              jsx: 'react-jsx',
              strict: true,
              noUnusedLocals: true,
              noUnusedParameters: true,
              noFallthroughCasesInSwitch: true,
            },
            include: ['src'],
            references: [{ path: './tsconfig.node.json' }],
          },
          null,
          2,
        ),
      },
      {
        path: 'tsconfig.node.json',
        content: JSON.stringify(
          {
            compilerOptions: {
              composite: true,
              skipLibCheck: true,
              module: 'ESNext',
              moduleResolution: 'bundler',
              allowSyntheticDefaultImports: true,
            },
            include: ['vite.config.ts'],
          },
          null,
          2,
        ),
      },
      {
        path: 'vite.config.ts',
        content:
          "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n  publicDir: 'public',\n  test: {\n    globals: true,\n    environment: 'jsdom',\n    setupFiles: './tests/setup.ts',\n    coverage: {\n      provider: 'v8',\n      reporter: ['text', 'json', 'html'],\n      exclude: ['node_modules/', 'tests/'],\n    },\n  },\n});\n",
      },
      {
        path: 'public/index.html',
        content:
          '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <link rel="icon" type="image/svg+xml" href="/vite.svg" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <meta name="description" content="React application built with Vite" />\n    <title>React App</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>\n',
      },
      {
        path: 'public/vite.svg',
        content:
          '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="31.88" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 257"><defs><linearGradient id="IconifyId1813088fe1fbc01fb466" x1="-.828%" x2="57.636%" y1="7.652%" y2="78.411%"><stop offset="0%" stop-color="#41D1FF"></stop><stop offset="100%" stop-color="#BD34FE"></stop></linearGradient><linearGradient id="IconifyId1813088fe1fbc01fb467" x1="43.376%" x2="50.316%" y1="2.242%" y2="89.03%"><stop offset="0%" stop-color="#FFEA83"></stop><stop offset="8.333%" stop-color="#FFDD35"></stop><stop offset="100%" stop-color="#FFA800"></stop></linearGradient></defs><path fill="url(#IconifyId1813088fe1fbc01fb466)" d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"></path><path fill="url(#IconifyId1813088fe1fbc01fb467)" d="M185.432.063L96.44 17.501a3.268 3.268 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028l72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"></path></svg>\n',
      },
      {
        path: '.gitignore',
        content: 'node_modules\ndist\nbuild\n.env\n.env.local\n.env.production\n*.log\n.DS_Store\ncoverage\n.vscode\n.idea\n',
      },
      {
        path: '.env.example',
        content: '# API Configuration\nVITE_API_URL=http://localhost:3000\n\n# Environment\nNODE_ENV=development\n\n# Feature Flags\nVITE_FEATURE_NEW_UI=false\n',
      },
      {
        path: 'Dockerfile',
        content:
          '# Multi-stage build for production\nFROM node:18-alpine AS builder\n\nWORKDIR /app\n\nCOPY package*.json ./\nRUN npm ci\n\nCOPY . .\nRUN npm run build\n\n# Production stage\nFROM nginx:alpine\n\nCOPY --from=builder /app/dist /usr/share/nginx/html\nCOPY nginx.conf /etc/nginx/conf.d/default.conf\n\nEXPOSE 80\n\nCMD ["nginx", "-g", "daemon off;"]\n',
      },
      {
        path: 'nginx.conf',
        content:
          'server {\n  listen 80;\n  server_name _;\n  root /usr/share/nginx/html;\n  index index.html;\n\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n\n  # Security headers\n  add_header X-Frame-Options "SAMEORIGIN" always;\n  add_header X-Content-Type-Options "nosniff" always;\n  add_header X-XSS-Protection "1; mode=block" always;\n\n  # Gzip compression\n  gzip on;\n  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;\n}\n',
      },
      {
        path: '.github/workflows/ci.yml',
        content:
          'name: CI/CD Pipeline\n\non:\n  push:\n    branches: [main, develop]\n  pull_request:\n    branches: [main, develop]\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - uses: actions/setup-node@v3\n        with:\n          node-version: \'18\'\n          cache: \'npm\'\n      - run: npm ci\n      - run: npm run lint\n      - run: npm run test\n      - run: npm run build\n\n  security:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - uses: actions/setup-node@v3\n        with:\n          node-version: \'18\'\n      - run: npm audit --audit-level=moderate\n',
      },
      {
        path: 'README.md',
        content:
          '# Layered React Architecture\n\nGenerated by MCP scaffolder - Production-ready React application.\n\n## 📁 Structure\n\n```\n├── public/              # Static assets\n│   ├── index.html\n│   └── vite.svg\n├── src/\n│   ├── components/      # Reusable UI components\n│   ├── hooks/           # Custom React hooks\n│   ├── services/        # API clients and business logic\n│   ├── pages/           # Page components\n│   ├── store/           # Global state management\n│   ├── styles/          # Global styles and themes\n│   ├── utils/           # Utility functions\n│   ├── config/          # Environment configuration\n│   └── assets/          # Images, icons, fonts\n├── tests/\n│   ├── unit/            # Unit tests\n│   ├── integration/     # Integration tests\n│   └── e2e/             # End-to-end tests\n├── .github/workflows/   # CI/CD pipelines\n├── Dockerfile           # Container configuration\n└── .env.example         # Environment variables template\n```\n\n## 🚀 Get Started\n\n### Development\n```bash\nnpm install\nnpm run dev\n```\n\n### Testing\n```bash\nnpm run test         # Run tests\nnpm run test:coverage # Coverage report\n```\n\n### Production Build\n```bash\nnpm run build\nnpm run preview\n```\n\n### Docker Deployment\n```bash\ndocker build -t my-app .\ndocker run -p 80:80 my-app\n```\n\n## 🔒 Environment Variables\n\nCopy `.env.example` to `.env` and configure:\n\n- `VITE_API_URL` - Backend API URL\n- `NODE_ENV` - Environment (development/production)\n\n## 📝 Best Practices\n\n- Components in `/components` should be reusable and well-documented\n- Use custom hooks for shared logic\n- Keep business logic in `/services`\n- Write tests for critical functionality\n- Follow TypeScript strict mode\n- Use ESLint and Prettier for code quality\n\n## 🛡️ Security\n\n- Never commit `.env` files\n- Audit dependencies regularly (`npm audit`)\n- Review security headers in `nginx.conf`\n- Validate all user inputs\n- Use HTTPS in production\n',
      },
    ],
  },
  feature: {
    label: 'Feature-Based (Modular)',
    directories: [
      'public',
      'src/features/auth/components',
      'src/features/auth/hooks',
      'src/features/auth/api',
      'src/features/dashboard/components',
      'src/features/dashboard/hooks',
      'src/features/dashboard/api',
      'src/shared/components',
      'src/shared/hooks',
      'src/shared/services',
      'src/shared/utils',
      'src/shared/types',
      'src/assets/images',
      'src/assets/icons',
      'src/assets/fonts',
    ],
    files: [
      { path: 'src/assets/images/.gitkeep', content: '' },
      { path: 'src/assets/icons/.gitkeep', content: '' },
      { path: 'src/assets/fonts/.gitkeep', content: '' },
      {
        path: 'src/features/auth/index.ts',
        content: "export * from './components';\nexport * from './hooks';\n",
      },
      { path: 'src/features/auth/components/index.ts', content: 'export {};\n' },
      { path: 'src/features/auth/hooks/index.ts', content: 'export {};\n' },
      { path: 'src/features/auth/api/index.ts', content: 'export {};\n' },
      {
        path: 'src/features/dashboard/index.ts',
        content: "export * from './components';\nexport * from './hooks';\n",
      },
      { path: 'src/features/dashboard/components/index.ts', content: 'export {};\n' },
      { path: 'src/features/dashboard/hooks/index.ts', content: 'export {};\n' },
      { path: 'src/features/dashboard/api/index.ts', content: 'export {};\n' },
      { path: 'src/shared/components/index.ts', content: 'export {};\n' },
      { path: 'src/shared/hooks/index.ts', content: 'export {};\n' },
      { path: 'src/shared/services/index.ts', content: 'export {};\n' },
      { path: 'src/shared/utils/index.ts', content: 'export {};\n' },
      { path: 'src/shared/types/index.ts', content: 'export type AppType = unknown;\n' },
      {
        path: 'src/App.tsx',
        content:
          "import React from 'react';\n\nfunction App() {\n  return <div>React App - Feature-Based</div>;\n}\n\nexport default App;\n",
      },
      {
        path: 'src/main.tsx',
        content:
          "import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);\n",
      },
      {
        path: 'package.json',
        content: JSON.stringify(
          {
            name: 'react-app-feature-based',
            version: '0.1.0',
            private: true,
            type: 'module',
            scripts: {
              dev: 'vite',
              build: 'tsc && vite build',
              lint: 'eslint . --ext ts,tsx',
              preview: 'vite preview',
            },
            dependencies: {
              react: '^18.3.1',
              'react-dom': '^18.3.1',
            },
            devDependencies: {
              '@types/react': '^18.3.3',
              '@types/react-dom': '^18.3.0',
              '@typescript-eslint/eslint-plugin': '^7.13.1',
              '@typescript-eslint/parser': '^7.13.1',
              '@vitejs/plugin-react': '^4.3.1',
              eslint: '^8.57.0',
              'eslint-plugin-react-hooks': '^4.6.2',
              'eslint-plugin-react-refresh': '^0.4.7',
              typescript: '^5.2.2',
              vite: '^5.3.1',
            },
          },
          null,
          2,
        ),
      },
      {
        path: 'tsconfig.json',
        content: JSON.stringify(
          {
            compilerOptions: {
              target: 'ES2020',
              useDefineForClassFields: true,
              lib: ['ES2020', 'DOM', 'DOM.Iterable'],
              module: 'ESNext',
              skipLibCheck: true,
              moduleResolution: 'bundler',
              allowImportingTsExtensions: true,
              resolveJsonModule: true,
              isolatedModules: true,
              noEmit: true,
              jsx: 'react-jsx',
              strict: true,
              noUnusedLocals: true,
              noUnusedParameters: true,
              noFallthroughCasesInSwitch: true,
              baseUrl: '.',
              paths: {
                '@features/*': ['src/features/*'],
                '@shared/*': ['src/shared/*'],
                '@assets/*': ['src/assets/*'],
              },
            },
            include: ['src'],
            references: [{ path: './tsconfig.node.json' }],
          },
          null,
          2,
        ),
      },
      {
        path: 'tsconfig.node.json',
        content: JSON.stringify(
          {
            compilerOptions: {
              composite: true,
              skipLibCheck: true,
              module: 'ESNext',
              moduleResolution: 'bundler',
              allowSyntheticDefaultImports: true,
            },
            include: ['vite.config.ts'],
          },
          null,
          2,
        ),
      },
      {
        path: 'vite.config.ts',
        content:
          "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nimport path from 'path';\n\nexport default defineConfig({\n  plugins: [react()],\n  publicDir: 'public',\n  resolve: {\n    alias: {\n      '@features': path.resolve(__dirname, './src/features'),\n      '@shared': path.resolve(__dirname, './src/shared'),\n      '@assets': path.resolve(__dirname, './src/assets'),\n    },\n  },\n});\n",
      },
      {
        path: 'public/index.html',
        content:
          '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <link rel="icon" type="image/svg+xml" href="/vite.svg" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>React App - Feature-Based</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>\n',
      },
      {
        path: 'public/vite.svg',
        content:
          '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="31.88" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 257"><defs><linearGradient id="IconifyId1813088fe1fbc01fb466" x1="-.828%" x2="57.636%" y1="7.652%" y2="78.411%"><stop offset="0%" stop-color="#41D1FF"></stop><stop offset="100%" stop-color="#BD34FE"></stop></linearGradient><linearGradient id="IconifyId1813088fe1fbc01fb467" x1="43.376%" x2="50.316%" y1="2.242%" y2="89.03%"><stop offset="0%" stop-color="#FFEA83"></stop><stop offset="8.333%" stop-color="#FFDD35"></stop><stop offset="100%" stop-color="#FFA800"></stop></linearGradient></defs><path fill="url(#IconifyId1813088fe1fbc01fb466)" d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"></path><path fill="url(#IconifyId1813088fe1fbc01fb467)" d="M185.432.063L96.44 17.501a3.268 3.268 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028l72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"></path></svg>\n',
      },
      {
        path: '.gitignore',
        content: 'node_modules\ndist\n.env\n.env.local\n*.log\n.DS_Store\n',
      },
      {
        path: 'README.md',
        content:
          '# Feature-Based React Architecture\n\nGenerated by MCP scaffolder.\n\n## Structure\n\nEach feature is self-contained with its own components, hooks, and API logic:\n\n- `/public` - Static assets (index.html, favicon)\n- `/src/features/auth` - Authentication feature\n- `/src/features/dashboard` - Dashboard feature\n- `/src/shared` - Shared components, hooks, services, and utilities\n- `/src/assets` - Application assets (images, icons, fonts)\n\n## Path Aliases\n\n- `@features/*` → `src/features/*`\n- `@shared/*` → `src/shared/*`\n- `@assets/*` → `src/assets/*`\n\n## Get Started\n\n```bash\nnpm install\nnpm run dev\n```\n',
      },
    ],
  },
  atomic: {
    label: 'Atomic Design',
    directories: [
      'public',
      'src/components/atoms',
      'src/components/molecules',
      'src/components/organisms',
      'src/components/templates',
      'src/pages',
      'src/styles',
      'src/hooks',
      'src/services',
      'src/utils',
      'src/assets/images',
      'src/assets/icons',
      'src/assets/fonts',
    ],
    files: [
      { path: 'src/assets/images/.gitkeep', content: '' },
      { path: 'src/assets/icons/.gitkeep', content: '' },
      { path: 'src/assets/fonts/.gitkeep', content: '' },
      { path: 'src/components/atoms/index.ts', content: '// Basic building blocks\nexport {};\n' },
      { path: 'src/components/molecules/index.ts', content: '// Composite of atoms\nexport {};\n' },
      {
        path: 'src/components/organisms/index.ts',
        content: '// Complex UI sections\nexport {};\n',
      },
      { path: 'src/components/templates/index.ts', content: '// Page layouts\nexport {};\n' },
      { path: 'src/pages/index.ts', content: '// Page instances\nexport {};\n' },
      { path: 'src/styles/index.ts', content: 'export {};\n' },
      { path: 'src/hooks/index.ts', content: 'export {};\n' },
      { path: 'src/services/index.ts', content: 'export {};\n' },
      { path: 'src/utils/index.ts', content: 'export {};\n' },
      {
        path: 'src/types.ts',
        content: '// Shared app types\nexport type AppType = unknown;\n',
      },
      {
        path: 'src/App.tsx',
        content:
          "import React from 'react';\n\nfunction App() {\n  return <div>React App - Atomic Design</div>;\n}\n\nexport default App;\n",
      },
      {
        path: 'src/main.tsx',
        content:
          "import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './styles';\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);\n",
      },
      {
        path: 'package.json',
        content: JSON.stringify(
          {
            name: 'react-app-atomic',
            version: '0.1.0',
            private: true,
            type: 'module',
            scripts: {
              dev: 'vite',
              build: 'tsc && vite build',
              lint: 'eslint . --ext ts,tsx',
              preview: 'vite preview',
              storybook: 'storybook dev -p 6006',
              'build-storybook': 'storybook build',
            },
            dependencies: {
              react: '^18.3.1',
              'react-dom': '^18.3.1',
            },
            devDependencies: {
              '@types/react': '^18.3.3',
              '@types/react-dom': '^18.3.0',
              '@typescript-eslint/eslint-plugin': '^7.13.1',
              '@typescript-eslint/parser': '^7.13.1',
              '@vitejs/plugin-react': '^4.3.1',
              eslint: '^8.57.0',
              'eslint-plugin-react-hooks': '^4.6.2',
              'eslint-plugin-react-refresh': '^0.4.7',
              typescript: '^5.2.2',
              vite: '^5.3.1',
            },
          },
          null,
          2,
        ),
      },
      {
        path: 'tsconfig.json',
        content: JSON.stringify(
          {
            compilerOptions: {
              target: 'ES2020',
              useDefineForClassFields: true,
              lib: ['ES2020', 'DOM', 'DOM.Iterable'],
              module: 'ESNext',
              skipLibCheck: true,
              moduleResolution: 'bundler',
              allowImportingTsExtensions: true,
              resolveJsonModule: true,
              isolatedModules: true,
              noEmit: true,
              jsx: 'react-jsx',
              strict: true,
              noUnusedLocals: true,
              noUnusedParameters: true,
              noFallthroughCasesInSwitch: true,
            },
            include: ['src'],
            references: [{ path: './tsconfig.node.json' }],
          },
          null,
          2,
        ),
      },
      {
        path: 'tsconfig.node.json',
        content: JSON.stringify(
          {
            compilerOptions: {
              composite: true,
              skipLibCheck: true,
              module: 'ESNext',
              moduleResolution: 'bundler',
              allowSyntheticDefaultImports: true,
            },
            include: ['vite.config.ts'],
          },
          null,
          2,
        ),
      },
      {
        path: 'vite.config.ts',
        content:
          "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n  publicDir: 'public',\n});\n",
      },
      {
        path: 'public/index.html',
        content:
          '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <link rel="icon" type="image/svg+xml" href="/vite.svg" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>React App - Atomic Design</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>\n',
      },
      {
        path: 'public/vite.svg',
        content:
          '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="31.88" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 257"><defs><linearGradient id="IconifyId1813088fe1fbc01fb466" x1="-.828%" x2="57.636%" y1="7.652%" y2="78.411%"><stop offset="0%" stop-color="#41D1FF"></stop><stop offset="100%" stop-color="#BD34FE"></stop></linearGradient><linearGradient id="IconifyId1813088fe1fbc01fb467" x1="43.376%" x2="50.316%" y1="2.242%" y2="89.03%"><stop offset="0%" stop-color="#FFEA83"></stop><stop offset="8.333%" stop-color="#FFDD35"></stop><stop offset="100%" stop-color="#FFA800"></stop></linearGradient></defs><path fill="url(#IconifyId1813088fe1fbc01fb466)" d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"></path><path fill="url(#IconifyId1813088fe1fbc01fb467)" d="M185.432.063L96.44 17.501a3.268 3.268 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028l72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"></path></svg>\n',
      },
      {
        path: '.gitignore',
        content: 'node_modules\ndist\n.env\n.env.local\n*.log\n.DS_Store\nstorybook-static\n',
      },
      {
        path: 'README.md',
        content:
          "# Atomic Design React Architecture\n\nGenerated by MCP scaffolder.\n\n## Structure\n\nBased on Brad Frost's Atomic Design methodology:\n\n- `/public` - Static assets (index.html, favicon)\n- **Atoms**: Basic building blocks (buttons, inputs, labels)\n- **Molecules**: Simple combinations of atoms (search form, card header)\n- **Organisms**: Complex UI components (header, product card)\n- **Templates**: Page-level layouts\n- **Pages**: Specific instances of templates with real data\n- `/src/assets` - Application assets (images, icons, fonts)\n\n## Best Practices\n\n1. Keep atoms simple and reusable\n2. Molecules combine 2-3 atoms\n3. Organisms are feature-complete sections\n4. Use Storybook for component documentation\n\n## Get Started\n\n```bash\nnpm install\nnpm run dev\n```\n\n## Storybook\n\n```bash\nnpm run storybook\n```\n",
      },
    ],
  },
  clean: {
    label: 'Clean Architecture (Backend-Agnostic)',
    directories: [
      'public',
      'src/backend/entities',
      'src/backend/usecases',
      'src/backend/interfaces',
      'src/backend/repositories',
      'src/backend/services',
      'src/backend/mappers',
      'src/frontend/components',
      'src/frontend/viewmodels',
      'src/frontend/pages',
      'src/frontend/hooks',
      'src/shared/utils',
      'src/shared/constants',
      'src/shared/types',
      'src/assets/images',
      'src/assets/icons',
      'src/assets/fonts',
    ],
    files: [
      { path: 'src/assets/images/.gitkeep', content: '' },
      { path: 'src/assets/icons/.gitkeep', content: '' },
      { path: 'src/assets/fonts/.gitkeep', content: '' },
      { path: 'src/backend/entities/index.ts', content: '// Core business entities (language-agnostic structures)\nexport {};\n' },
      { path: 'src/backend/usecases/index.ts', content: '// Business use cases and application logic\nexport {};\n' },
      { path: 'src/backend/interfaces/index.ts', content: '// Repository and service interfaces\nexport {};\n' },
      {
        path: 'src/backend/repositories/index.ts',
        content: '// Repository implementations for data access\nexport {};\n',
      },
      { path: 'src/backend/services/index.ts', content: '// External API clients and services\nexport {};\n' },
      { path: 'src/backend/mappers/index.ts', content: '// DTO to Entity mappers\nexport {};\n' },
      { path: 'src/frontend/components/index.ts', content: '// Reusable UI components\nexport {};\n' },
      { path: 'src/frontend/viewmodels/index.ts', content: '// ViewModels for state management\nexport {};\n' },
      { path: 'src/frontend/pages/index.ts', content: '// Page-level components\nexport {};\n' },
      { path: 'src/frontend/hooks/index.ts', content: '// Custom React hooks\nexport {};\n' },
      { path: 'src/shared/utils/index.ts', content: '// Shared utility functions\nexport {};\n' },
      { path: 'src/shared/constants/index.ts', content: '// Shared constants\nexport {};\n' },
      { path: 'src/shared/types/index.ts', content: '// Shared TypeScript types\nexport type AppType = unknown;\n' },
      {
        path: 'src/App.tsx',
        content:
          "import React from 'react';\n\nfunction App() {\n  return <div>React App - Clean Architecture</div>;\n}\n\nexport default App;\n",
      },
      {
        path: 'src/main.tsx',
        content:
          "import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);\n",
      },
      {
        path: 'package.json',
        content: JSON.stringify(
          {
            name: 'react-app-clean-architecture',
            version: '0.1.0',
            private: true,
            type: 'module',
            scripts: {
              dev: 'vite',
              build: 'tsc && vite build',
              lint: 'eslint . --ext ts,tsx',
              test: 'vitest',
              preview: 'vite preview',
            },
            dependencies: {
              react: '^18.3.1',
              'react-dom': '^18.3.1',
            },
            devDependencies: {
              '@types/react': '^18.3.3',
              '@types/react-dom': '^18.3.0',
              '@typescript-eslint/eslint-plugin': '^7.13.1',
              '@typescript-eslint/parser': '^7.13.1',
              '@vitejs/plugin-react': '^4.3.1',
              eslint: '^8.57.0',
              'eslint-plugin-react-hooks': '^4.6.2',
              'eslint-plugin-react-refresh': '^0.4.7',
              typescript: '^5.2.2',
              vite: '^5.3.1',
              vitest: '^1.6.0',
            },
          },
          null,
          2,
        ),
      },
      {
        path: 'tsconfig.json',
        content: JSON.stringify(
          {
            compilerOptions: {
              target: 'ES2020',
              useDefineForClassFields: true,
              lib: ['ES2020', 'DOM', 'DOM.Iterable'],
              module: 'ESNext',
              skipLibCheck: true,
              moduleResolution: 'bundler',
              allowImportingTsExtensions: true,
              resolveJsonModule: true,
              isolatedModules: true,
              noEmit: true,
              jsx: 'react-jsx',
              strict: true,
              noUnusedLocals: true,
              noUnusedParameters: true,
              noFallthroughCasesInSwitch: true,
              baseUrl: '.',
              paths: {
                '@backend/*': ['src/backend/*'],
                '@frontend/*': ['src/frontend/*'],
                '@shared/*': ['src/shared/*'],
                '@assets/*': ['src/assets/*'],
              },
            },
            include: ['src'],
            references: [{ path: './tsconfig.node.json' }],
          },
          null,
          2,
        ),
      },
      {
        path: 'tsconfig.node.json',
        content: JSON.stringify(
          {
            compilerOptions: {
              composite: true,
              skipLibCheck: true,
              module: 'ESNext',
              moduleResolution: 'bundler',
              allowSyntheticDefaultImports: true,
            },
            include: ['vite.config.ts'],
          },
          null,
          2,
        ),
      },
      {
        path: 'vite.config.ts',
        content:
          "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nimport path from 'path';\n\nexport default defineConfig({\n  plugins: [react()],\n  publicDir: 'public',\n  resolve: {\n    alias: {\n      '@backend': path.resolve(__dirname, './src/backend'),\n      '@frontend': path.resolve(__dirname, './src/frontend'),\n      '@shared': path.resolve(__dirname, './src/shared'),\n      '@assets': path.resolve(__dirname, './src/assets'),\n    },\n  },\n  test: {\n    globals: true,\n    environment: 'jsdom',\n  },\n});\n",
      },
      {
        path: 'public/index.html',
        content:
          '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <link rel="icon" type="image/svg+xml" href="/vite.svg" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>React App - Clean Architecture</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>\n',
      },
      {
        path: 'public/vite.svg',
        content:
          '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="31.88" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 257"><defs><linearGradient id="IconifyId1813088fe1fbc01fb466" x1="-.828%" x2="57.636%" y1="7.652%" y2="78.411%"><stop offset="0%" stop-color="#41D1FF"></stop><stop offset="100%" stop-color="#BD34FE"></stop></linearGradient><linearGradient id="IconifyId1813088fe1fbc01fb467" x1="43.376%" x2="50.316%" y1="2.242%" y2="89.03%"><stop offset="0%" stop-color="#FFEA83"></stop><stop offset="8.333%" stop-color="#FFDD35"></stop><stop offset="100%" stop-color="#FFA800"></stop></linearGradient></defs><path fill="url(#IconifyId1813088fe1fbc01fb466)" d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"></path><path fill="url(#IconifyId1813088fe1fbc01fb467)" d="M185.432.063L96.44 17.501a3.268 3.268 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028l72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"></path></svg>\n',
      },
      {
        path: '.gitignore',
        content: 'node_modules\ndist\n.env\n.env.local\n*.log\n.DS_Store\ncoverage\n',
      },
      {
        path: 'README.md',
        content:
          '# Clean Architecture React Application\n\nGenerated by MCP scaffolder.\n\n## Architecture Overview\n\nThis architecture separates concerns into distinct layers, making it easier for teams to work independently and maintain the codebase.\n\n## Structure\n\n### 📁 `/public`\n- Static assets (index.html, favicon)\n\n### 🔧 `/src/backend` (Business Logic - Language Agnostic)\n- **entities/**: Core business objects and data structures\n- **usecases/**: Application-specific business rules and logic\n- **interfaces/**: Contracts/interfaces for repositories and services\n- **repositories/**: Data access implementations\n- **services/**: External API clients and integrations\n- **mappers/**: Transform data between layers (DTO ↔ Entity)\n\n> 💡 **Note**: The backend folder contains business logic that can be implemented in any language (.NET, Java, Python, Node.js). The structure shown here is for frontend integration.\n\n### 🎨 `/src/frontend` (UI Layer - React)\n- **components/**: Reusable UI components\n- **viewmodels/**: State management and UI logic\n- **pages/**: Page-level route components\n- **hooks/**: Custom React hooks\n\n### 🤝 `/src/shared`\n- **utils/**: Helper functions used across layers\n- **constants/**: Shared constants and configurations\n- **types/**: Shared TypeScript type definitions\n\n### 🖼️ `/src/assets`\n- Application assets (images, icons, fonts)\n\n## Dependency Rule\n\nDependencies flow inward (Dependency Inversion Principle):\n- **Frontend** depends on **Backend** interfaces\n- **Backend** implementations depend on **Backend** interfaces\n- **Backend** core entities depend on nothing (pure business logic)\n\nThis allows you to:\n- Replace the backend implementation without changing frontend\n- Test business logic independently\n- Scale and maintain code more easily\n\n## Path Aliases\n\n- `@backend/*` → `src/backend/*`\n- `@frontend/*` → `src/frontend/*`\n- `@shared/*` → `src/shared/*`\n- `@assets/*` → `src/assets/*`\n\n## Get Started\n\n```bash\nnpm install\nnpm run dev\n```\n\n## Testing\n\n```bash\nnpm test\n```\n\n## Best Practices\n\n1. Keep business logic in `/backend` - it should be framework-agnostic\n2. UI components in `/frontend` should be dumb and reusable\n3. Use ViewModels to orchestrate business logic and UI state\n4. Define interfaces in `/backend/interfaces` before implementations\n5. Use mappers to transform data between API responses and entities\n',
      },
    ],
  },
};

/**
 * Type guard to check if an error is a Node.js Errno exception
 */
const isErrnoException = (error: unknown): error is NodeJS.ErrnoException =>
  error instanceof Error && 'code' in error;

/**
 * Resolves and validates a target path to prevent directory traversal attacks
 * @param inputPath - The user-provided target path
 * @param baseDir - The base directory to resolve against
 * @returns The resolved absolute path
 * @throws {Error} If the path attempts to escape the base directory
 */
export const resolveSafeTarget = (inputPath: string, baseDir: string): string => {
  const resolved = path.resolve(baseDir, inputPath);
  const relative = path.relative(baseDir, resolved);

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(
      `Security violation: Target path '${inputPath}' must be within the current working directory.`,
    );
  }

  return resolved;
};

/**
 * Ensures a directory exists, creating it recursively if needed
 * @param dirPath - The directory path to create
 * @throws {Error} If directory creation fails
 */
const ensureDirectory = async (dirPath: string): Promise<void> => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    throw new Error(
      `Failed to create directory '${dirPath}': ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

/**
 * Creates a file with the given content if it doesn't already exist
 * @param filePath - The file path to create
 * @param content - The content to write
 * @returns true if the file was created, false if it already exists
 * @throws {Error} If file creation fails for reasons other than file existence
 */
const ensureFile = async (filePath: string, content: string): Promise<boolean> => {
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, { flag: 'wx' });
    return true;
  } catch (error) {
    if (isErrnoException(error) && error.code === 'EEXIST') {
      return false;
    }
    throw new Error(
      `Failed to create file '${filePath}': ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

/**
 * Scaffolds a React project with the specified architecture pattern
 * @param inputPath - The target directory path (relative or absolute)
 * @param patternType - The architecture pattern to use
 * @param baseDir - The base directory to resolve relative paths against
 * @returns An object containing the resolved path and lists of created/skipped files
 * @throws {Error} If path validation fails or file system operations fail
 */
export const scaffoldProject = async (
  inputPath: string,
  patternType: PatternType,
  baseDir: string,
): Promise<ScaffoldResult> => {
  const resolvedTarget = resolveSafeTarget(inputPath, baseDir);
  const pattern = PATTERNS[patternType];

  await ensureDirectory(resolvedTarget);

  const createdDirs: string[] = [];
  const createdFiles: string[] = [];
  const skippedFiles: string[] = [];

  for (const dir of pattern.directories) {
    await ensureDirectory(path.join(resolvedTarget, dir));
    createdDirs.push(dir);
  }

  for (const file of pattern.files) {
    const created = await ensureFile(path.join(resolvedTarget, file.path), file.content);
    if (created) {
      createdFiles.push(file.path);
    } else {
      skippedFiles.push(file.path);
    }
  }

  return { resolvedTarget, createdDirs, createdFiles, skippedFiles, label: pattern.label };
};

/**
 * Creates and configures the MCP server with React scaffolding tools
 * @returns A configured MCP Server instance
 */
export const createServer = () => {
  const server = new Server(
    { name: 'react-architecture-scaffolder', version: '1.0.0' },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'describe_architectures',
        description: 'Compare common React architecture patterns and when to use each one.',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
      },
      {
        name: 'scaffold_react_project',
        description: 'Create a React architecture folder structure and placeholder files.',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Target directory to scaffold.' },
            pattern_type: {
              type: 'string',
              enum: ['layered', 'feature', 'atomic', 'clean'],
              description: 'Architecture pattern: layered, feature, atomic, or clean.',
            },
          },
          required: ['path', 'pattern_type'],
          additionalProperties: false,
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;

    try {
      if (toolName === 'describe_architectures') {
        return {
          content: [{ type: 'text', text: ARCHITECTURE_DESCRIPTION }],
        };
      }

      if (toolName === 'scaffold_react_project') {
        const input = ScaffoldInputSchema.parse(request.params.arguments ?? {});
        const result = await scaffoldProject(input.path, input.pattern_type, process.cwd());

        const responseParts = [
          `✅ Successfully scaffolded: ${result.label}`,
          `📁 Target: ${result.resolvedTarget}`,
          `📂 Created ${result.createdDirs.length} directories`,
          `📄 Created ${result.createdFiles.length} files`,
        ];

        if (result.skippedFiles.length > 0) {
          responseParts.push(`⚠️  Skipped ${result.skippedFiles.length} existing files`);
        }

        responseParts.push('\n🚀 Next steps:');
        responseParts.push('  cd ' + path.basename(result.resolvedTarget));
        responseParts.push('  npm install');
        responseParts.push('  npm run dev');

        return {
          content: [{ type: 'text', text: responseParts.join('\n') }],
        };
      }

      throw new Error(`Unknown tool: ${toolName}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: 'text', text: `❌ Error: ${errorMessage}` }],
        isError: true,
      };
    }
  });

  return server;
};
