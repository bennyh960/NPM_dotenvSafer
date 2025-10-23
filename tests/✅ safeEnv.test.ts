import fs from 'fs';
import path from 'path';
import { config, configMultiple } from '../src/index';

const TMP_DIR = path.join(process.cwd(), '__test_envs__');

beforeAll(() => {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);
});

afterAll(() => {
  // Clean up temporary files
  fs.rmSync(TMP_DIR, { recursive: true, force: true });
});

function writeEnvFiles(envContent: string, exampleContent: string, name = 'default') {
  const envPath = path.join(TMP_DIR, `.env.${name}`);
  const examplePath = envPath + '.example';
  fs.writeFileSync(envPath, envContent);
  fs.writeFileSync(examplePath, exampleContent);
  return { envPath, examplePath };
}

describe('safeEnv.config()', () => {
  it('returns error if env path is invalid', () => {
    const result = config({ path: '' });
    expect(result.error?.message).toMatch(/invalid env file path/i);
  });

  it('returns error if .env file does not exist', () => {
    const fakePath = path.join(TMP_DIR, 'missing.env');
    const result = config({ path: fakePath });
    expect(result.error?.message).toMatch(/Env file not found/);
  });

  it('returns error if example file is missing', () => {
    const envPath = path.join(TMP_DIR, 'only.env');
    fs.writeFileSync(envPath, 'A=1');
    const result = config({ path: envPath });
    expect(result.error?.message).toMatch(/Documented env file not found/);
  });

  it('returns error when variables are missing in .env', () => {
    const { envPath } = writeEnvFiles('A=1', 'A=1\nB=2');
    const result = config({ path: envPath, pathSuffix: '.example' });
    expect(result.error?.message).toMatch(/missing.*B/i);
  });

  it('returns error when .env has undocumented variables', () => {
    const { envPath } = writeEnvFiles('A=1\nX=9', 'A=1');
    const result = config({ path: envPath });
    expect(result.error?.message).toMatch(/undocumented.*X/i);
  });

  it('returns error when same values exist in both files', () => {
    const { envPath } = writeEnvFiles('A=same', 'A=same');
    const result = config({ path: envPath });
    expect(result.error?.message).toMatch(/same value.*A/i);
  });

  it('returns parsed vars and updates process.env when all good', () => {
    const { envPath } = writeEnvFiles('A=real\nB=value', 'A=placeholder\nB=placeholder');
    const result = config({ path: envPath });
    expect(result.error).toBeUndefined();
    expect(result.parsed).toEqual({ A: 'real', B: 'value' });
    expect(process.env.A).toBe('real');
    expect(process.env.B).toBe('value');
  });
});

describe('safeEnv.configMultiple()', () => {
  it('runs multiple env validations', () => {
    const env1 = writeEnvFiles('A=1', 'A=x');
    const env2 = writeEnvFiles('B=2', 'B=y');

    const results = configMultiple([{ path: env1.envPath }, { path: env2.envPath }]);
    expect(results).toHaveLength(2);
    expect(results[0].parsed).toBeDefined();
    expect(results[1].parsed).toBeDefined();
  });
});
