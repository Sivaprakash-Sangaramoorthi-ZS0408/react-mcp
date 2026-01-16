import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { resolveSafeTarget, scaffoldProject, type PatternType } from '../server.js';

const createTempDir = async () => {
  const base = await fs.mkdtemp(path.join(os.tmpdir(), 'mcp-scaffold-'));
  return base;
};

const cleanupDir = async (dirPath: string) => {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
};

describe('resolveSafeTarget', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await createTempDir();
  });

  afterEach(async () => {
    await cleanupDir(tempDir);
  });

  it('allows relative paths within base directory', () => {
    const result = resolveSafeTarget('my-app', tempDir);
    expect(result).toBe(path.join(tempDir, 'my-app'));
  });

  it('allows nested relative paths', () => {
    const result = resolveSafeTarget('apps/frontend', tempDir);
    expect(result).toBe(path.join(tempDir, 'apps', 'frontend'));
  });

  it('throws when path escapes with ..', () => {
    expect(() => resolveSafeTarget('..', tempDir)).toThrow(/Security violation/);
  });

  it('throws when path escapes with ../../', () => {
    expect(() => resolveSafeTarget('../../etc', tempDir)).toThrow(/Security violation/);
  });

  it('throws for absolute paths outside base', () => {
    expect(() => resolveSafeTarget('/etc/passwd', tempDir)).toThrow(/Security violation/);
  });
});

describe('scaffoldProject - Layered Pattern', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await createTempDir();
  });

  afterEach(async () => {
    await cleanupDir(tempDir);
  });

  it('creates all expected directories', async () => {
    const result = await scaffoldProject('layered-app', 'layered', tempDir);

    expect(result.label).toBe('Layered (Standard)');
    expect(result.createdDirs.length).toBeGreaterThan(0);

    const componentsDir = path.join(result.resolvedTarget, 'src', 'components');
    const stats = await fs.stat(componentsDir);
    expect(stats.isDirectory()).toBe(true);
  });

  it('creates package.json', async () => {
    const result = await scaffoldProject('layered-app', 'layered', tempDir);
    const packageJsonPath = path.join(result.resolvedTarget, 'package.json');

    const content = await fs.readFile(packageJsonPath, 'utf-8');
    const pkg = JSON.parse(content);

    expect(pkg.name).toBe('react-app-layered');
    expect(pkg.dependencies).toHaveProperty('react');
  });

  it('creates tsconfig.json', async () => {
    const result = await scaffoldProject('layered-app', 'layered', tempDir);
    const tsconfigPath = path.join(result.resolvedTarget, 'tsconfig.json');

    const content = await fs.readFile(tsconfigPath, 'utf-8');
    const config = JSON.parse(content);

    expect(config.compilerOptions).toHaveProperty('strict');
    expect(config.compilerOptions.strict).toBe(true);
  });

  it('creates index.html', async () => {
    const result = await scaffoldProject('layered-app', 'layered', tempDir);
    const indexPath = path.join(result.resolvedTarget, 'index.html');

    const content = await fs.readFile(indexPath, 'utf-8');
    expect(content).toContain('<!DOCTYPE html>');
    expect(content).toContain('id="root"');
  });

  it('does not overwrite existing files', async () => {
    const result1 = await scaffoldProject('layered-app', 'layered', tempDir);
    expect(result1.skippedFiles.length).toBe(0);

    const result2 = await scaffoldProject('layered-app', 'layered', tempDir);
    expect(result2.skippedFiles.length).toBeGreaterThan(0);
  });
});

describe('scaffoldProject - Feature-Based Pattern', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await createTempDir();
  });

  afterEach(async () => {
    await cleanupDir(tempDir);
  });

  it('creates feature directories', async () => {
    const result = await scaffoldProject('feature-app', 'feature', tempDir);

    const authPath = path.join(result.resolvedTarget, 'src', 'features', 'auth');
    const dashboardPath = path.join(result.resolvedTarget, 'src', 'features', 'dashboard');

    const [authStats, dashboardStats] = await Promise.all([
      fs.stat(authPath),
      fs.stat(dashboardPath),
    ]);

    expect(authStats.isDirectory()).toBe(true);
    expect(dashboardStats.isDirectory()).toBe(true);
  });

  it('creates shared directory', async () => {
    const result = await scaffoldProject('feature-app', 'feature', tempDir);

    const sharedPath = path.join(result.resolvedTarget, 'src', 'shared');
    const stats = await fs.stat(sharedPath);

    expect(stats.isDirectory()).toBe(true);
  });

  it('includes path aliases in tsconfig', async () => {
    const result = await scaffoldProject('feature-app', 'feature', tempDir);
    const tsconfigPath = path.join(result.resolvedTarget, 'tsconfig.json');

    const content = await fs.readFile(tsconfigPath, 'utf-8');
    const config = JSON.parse(content);

    expect(config.compilerOptions.paths).toHaveProperty('@features/*');
    expect(config.compilerOptions.paths).toHaveProperty('@shared/*');
  });
});

describe('scaffoldProject - Atomic Design Pattern', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await createTempDir();
  });

  afterEach(async () => {
    await cleanupDir(tempDir);
  });

  it('creates atomic design hierarchy', async () => {
    const result = await scaffoldProject('atomic-app', 'atomic', tempDir);

    const atomsPath = path.join(result.resolvedTarget, 'src', 'components', 'atoms');
    const moleculesPath = path.join(result.resolvedTarget, 'src', 'components', 'molecules');
    const organismsPath = path.join(result.resolvedTarget, 'src', 'components', 'organisms');

    const [atomsStats, moleculesStats, organismsStats] = await Promise.all([
      fs.stat(atomsPath),
      fs.stat(moleculesPath),
      fs.stat(organismsPath),
    ]);

    expect(atomsStats.isDirectory()).toBe(true);
    expect(moleculesStats.isDirectory()).toBe(true);
    expect(organismsStats.isDirectory()).toBe(true);
  });
});

describe('scaffoldProject - Clean Architecture Pattern', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await createTempDir();
  });

  afterEach(async () => {
    await cleanupDir(tempDir);
  });

  it('creates domain, data, and presentation layers', async () => {
    const result = await scaffoldProject('clean-app', 'clean', tempDir);

    const domainPath = path.join(result.resolvedTarget, 'src', 'domain');
    const dataPath = path.join(result.resolvedTarget, 'src', 'data');
    const presentationPath = path.join(result.resolvedTarget, 'src', 'presentation');

    const [domainStats, dataStats, presentationStats] = await Promise.all([
      fs.stat(domainPath),
      fs.stat(dataPath),
      fs.stat(presentationPath),
    ]);

    expect(domainStats.isDirectory()).toBe(true);
    expect(dataStats.isDirectory()).toBe(true);
    expect(presentationStats.isDirectory()).toBe(true);
  });

  it('includes layer-based path aliases', async () => {
    const result = await scaffoldProject('clean-app', 'clean', tempDir);
    const tsconfigPath = path.join(result.resolvedTarget, 'tsconfig.json');

    const content = await fs.readFile(tsconfigPath, 'utf-8');
    const config = JSON.parse(content);

    expect(config.compilerOptions.paths).toHaveProperty('@domain/*');
    expect(config.compilerOptions.paths).toHaveProperty('@data/*');
    expect(config.compilerOptions.paths).toHaveProperty('@presentation/*');
  });
});

describe('scaffoldProject - All Patterns', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await createTempDir();
  });

  afterEach(async () => {
    await cleanupDir(tempDir);
  });

  it.each<PatternType>(['layered', 'feature', 'atomic', 'clean'])(
    'creates .gitignore for %s pattern',
    async (pattern) => {
      const result = await scaffoldProject(`${pattern}-app`, pattern, tempDir);
      const gitignorePath = path.join(result.resolvedTarget, '.gitignore');

      const content = await fs.readFile(gitignorePath, 'utf-8');
      expect(content).toContain('node_modules');
      expect(content).toContain('dist');
    },
  );

  it.each<PatternType>(['layered', 'feature', 'atomic', 'clean'])(
    'creates README.md for %s pattern',
    async (pattern) => {
      const result = await scaffoldProject(`${pattern}-app`, pattern, tempDir);
      const readmePath = path.join(result.resolvedTarget, 'README.md');

      const content = await fs.readFile(readmePath, 'utf-8');
      expect(content).toContain('Architecture');
      expect(content).toContain('npm install');
    },
  );

  it.each<PatternType>(['layered', 'feature', 'atomic', 'clean'])(
    'creates vite.config.ts for %s pattern',
    async (pattern) => {
      const result = await scaffoldProject(`${pattern}-app`, pattern, tempDir);
      const vitePath = path.join(result.resolvedTarget, 'vite.config.ts');

      const content = await fs.readFile(vitePath, 'utf-8');
      expect(content).toContain('defineConfig');
      expect(content).toContain('react');
    },
  );
});
