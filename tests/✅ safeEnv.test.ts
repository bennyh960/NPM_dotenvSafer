import fs from 'fs';
import path from 'path';
import { config, configMultiple } from '../src/index.js';
import { SafeEnvError } from '../src/utils/safeEnvError.js';

const TEST_DIR = path.join(process.cwd(), '__test_envs__');

beforeAll(() => {
  if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR);
});

afterAll(() => {
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

const writeFile = (name: string, content: string) => {
  const filePath = path.join(TEST_DIR, name);
  fs.writeFileSync(filePath, content);
  return filePath;
};

describe('safeEnv config()', () => {
  it('should return error for invalid env path', () => {
    const result = config({ path: [''] });
    expect(result.error).toBeInstanceOf(SafeEnvError);
    expect(result.error?.code).toBe('000_400');
  });

  it('should return error when .env file missing', () => {
    const envPath = path.join(TEST_DIR, 'missing.env');
    const result = config({ path: envPath });
    expect(result.error).toBeInstanceOf(SafeEnvError);
    expect(result.error?.code).toBe('001_404');
  });

  it('should return error when example file missing', () => {
    const envPath = writeFile('.env', 'A=1');
    const result = config({ path: envPath });
    expect(result.error).toBeInstanceOf(SafeEnvError);
    expect(result.error?.code).toBe('002_404');
  });

  it('should return error for missing documented vars', () => {
    const envPath = writeFile('.env', 'A=1');
    const examplePath = writeFile('.env.example', 'A=1\nB=2');
    const result = config({ path: envPath });
    expect(result.error).toBeInstanceOf(SafeEnvError);
    expect(result.error?.code).toBe('003_MISSING');
  });

  it('should return error for undocumented vars', () => {
    const envPath = writeFile('.env', 'A=1\nB=2');
    const examplePath = writeFile('.env.example', 'A=1');
    const result = config({ path: envPath });
    expect(result.error).toBeInstanceOf(SafeEnvError);
    expect(result.error?.code).toBe('004_UNDOCUMENTED');
  });

  it('should return error for same values between env and example', () => {
    const envPath = writeFile('.env', 'A=1\nB=2');
    const examplePath = writeFile('.env.example', 'A=1\nB=2');
    const result = config({ path: envPath });
    expect(result.error).toBeInstanceOf(SafeEnvError);
    expect(result.error?.code).toBe('005_SAME_VALUE');
  });

  it('should succeed when env matches documented example properly', () => {
    const envPath = writeFile('.env', 'A=production\nB=secret');
    const examplePath = writeFile('.env.example', 'A=example_value\nB=placeholder');
    const result = config({ path: envPath });
    expect(result.error).toBeUndefined();
    expect(result.parsed).toEqual({ A: 'production', B: 'secret' });
    expect(process.env.A).toBe('production');
  });
  // ✅ pathSuffix TESTS:
  it('should return error when documented file with custom suffix is missing', () => {
    const envPath = writeFile('custom.env', 'X=1');
    // No "custom.env.sample" created → should fail
    const result = config({ path: envPath, pathSuffix: '.sample' });
    expect(result.error).toBeInstanceOf(SafeEnvError);
    expect(result.error?.code).toBe('002_404');
  });

  it('should succeed when using custom suffix and both files exist', () => {
    const envPath = writeFile('custom.env', 'TOKEN=live_secret\nMODE=prod');
    writeFile('custom.env.sample', 'TOKEN=placeholder\nMODE=example');
    const result = config({ path: envPath, pathSuffix: '.sample' });
    expect(result.error).toBeUndefined();
    expect(result.parsed).toEqual({ TOKEN: 'live_secret', MODE: 'prod' });
  });
});

describe('safeEnv strict mode', () => {
  it('should throw for invalid env path', () => {
    expect(() => config({ path: [''], strict: true })).toThrow(SafeEnvError);
  });

  it('should throw when .env file missing', () => {
    const envPath = path.join(TEST_DIR, 'missing_strict.env');
    expect(() => config({ path: envPath, strict: true })).toThrow(SafeEnvError);
  });

  it('should throw when example file missing', () => {
    const envPath = writeFile('strict.env', 'A=1');
    expect(() => config({ path: envPath, strict: true })).toThrow(SafeEnvError);
  });

  // it('should throw for missing documented vars', () => {
  //   const envPath = writeFile('strict_missing.env', 'A=1');
  //   const examplePath = writeFile('strict_missing.env.example', 'A=1\nB=2');
  //   expect(() => config({ path: envPath, strict: true })).toThrowError((error: any) => error.code === '003_MISSING');
  // });

  // it('should throw for missing documented vars', () => {
  //   const envPath = writeFile('strict_missing.env', 'A=1');
  //   writeFile('strict_missing.env.example', 'A=1\nB=2');
  //   expect(() => config({ path: envPath, strict: true })).toThrowError(
  //     (err: any) => err instanceof SafeEnvError && err.code === '003_MISSING'
  //   );
  // });

  // it('should throw for same values between env and example', () => {
  //   const envPath = writeFile('strict_same.env', 'A=1\nB=2');
  //   const examplePath = writeFile('strict_same.env.example', 'A=1\nB=2');
  //   expect(() => config({ path: envPath, strict: true })).toThrowErrorMatchingObject({
  //     code: '005_SAME_VALUE',
  //   });
  // });

  // it('should not throw when env matches example properly', () => {
  //   const envPath = writeFile('strict_valid.env', 'A=prod\nB=secret');
  //   writeFile('strict_valid.env.example', 'A=placeholder\nB=example');
  //   expect(() => config({ path: envPath, strict: true })).not.toThrow();
  //   const result = config({ path: envPath, strict: true });
  //   expect(result.parsed).toEqual({ A: 'prod', B: 'secret' });
  // });
});

describe('safeEnv configMultiple()', () => {
  it('should handle multiple configurations', () => {
    const env1 = writeFile('one.env', 'A=1');
    const example1 = writeFile('one.env.example', 'A=example');

    const env2 = writeFile('two.env', 'B=prod');
    const example2 = writeFile('two.env.example', 'B=placeholder');

    const results = configMultiple([{ path: env1 }, { path: env2 }]);

    expect(results).toHaveLength(2);
    expect(results[0].error).toBeUndefined();
    expect(results[1].error).toBeUndefined();
  });
});
