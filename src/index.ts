import fs from 'fs';
import dotenv from 'dotenv';
import type { GuardianEnvResults, GuardianEnvConfig } from './utils/types.js';
import { EnvGuardianError } from './utils/guardianError.js';
import { errorCodeMap } from './utils/constants.js';
import { validateGitIgnore } from './utils/gitignoreValidation.js';

/**
 * Validates the environment variables against the documented example,
 * and loads them into process.env (like dotenv).
 */
export function config(options: GuardianEnvConfig = {}): GuardianEnvResults {
  const envPathSuffix = options.pathSuffix ?? '.example';

  const envPath = options.path || '.env';
  const examplePath = envPath + envPathSuffix;

  // Skip validation if in production/serverless environment
  if (process.env.VERCEL || process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod') {
    console.log('⚠️  Running in production - skipping .env file validation');
    return { error: undefined, parsed: process.env as any };
  }

  if (typeof envPath !== 'string') {
    const error = new EnvGuardianError('Invalid env file path provided', {
      code: '000_400',
      context: errorCodeMap['000_400'],
      hint: 'Provide a valid string path to the .env file. (for multi files use `configMultiple`',
    });

    error.notify(options.strict);

    return {
      error: error,
      parsed: undefined,
    };
  }

  if (!fs.existsSync(envPath)) {
    const error = new EnvGuardianError(`Env file not found at ${process.cwd()}`, {
      code: '001_404',
      context: errorCodeMap['001_404'],
    });
    error.notify(options.strict);
    return {
      error: error,
      parsed: undefined,
    };
  }
  if (!fs.existsSync(examplePath)) {
    const error = new EnvGuardianError(
      `Documented env file not found at ${examplePath} (expected path based on ${envPath} with ${envPathSuffix} suffix)`,
      {
        code: '002_404',
        context: errorCodeMap['002_404'],
        hint: `Ensure the documented .env${envPathSuffix} file exists at the same level of original env file.`,
      }
    );

    error.notify(options.strict);

    return {
      error: error,
      parsed: undefined,
    };
  }

  const originalEnv = dotenv.config({ path: envPath, ...options });
  const documentedEnv = dotenv.config({ path: examplePath, quiet: true, debug: false });

  const originalEnvParsed = originalEnv.parsed || {};
  const documentedEnvParsed = documentedEnv.parsed || {};

  // Gather missing / extra / same vars
  const missingInEnv = Object.keys(documentedEnvParsed).filter(key => !(key in originalEnvParsed));
  const undocumentedVars = Object.keys(originalEnvParsed).filter(key => !(key in documentedEnvParsed));
  const sameVars = Object.keys(documentedEnvParsed).filter(
    key => key in originalEnvParsed && originalEnvParsed[key] === documentedEnvParsed[key]
  );

  if (missingInEnv.length > 0) {
    const error = new EnvGuardianError(`The following variables are documented but missing in ${envPath}: ${missingInEnv.join(', ')}`, {
      code: '003_MISSING',
      context: errorCodeMap['003_MISSING'],
      hint: 'Ensure all documented variables are defined in the actual .env file.',
    });

    error.notify(options.strict);

    return {
      error,
      parsed: undefined,
    };
  }
  if (undocumentedVars.length > 0) {
    const error = new EnvGuardianError(
      `The following variables are present in ${envPath} but not documented in ${examplePath}: ${undocumentedVars.join(', ')}`,
      {
        code: '004_UNDOCUMENTED',
        context: errorCodeMap['004_UNDOCUMENTED'],
        hint: 'Consider documenting all variables in the example file.',
      }
    );

    error.notify(options.strict);

    return {
      error,
      parsed: undefined,
    };
  }
  if (sameVars.length > 0) {
    const error = new EnvGuardianError(
      `\n\nDuplicate environment variable values detected in both paths:\n\noriginal path: ${envPath}\ndocumented path: ${examplePath}\nvalues:${sameVars.join(
        ', '
      )}\n`,
      {
        code: '005_SAME_VALUE',
        context: errorCodeMap['005_SAME_VALUE'],
        hint: `Use different values in the documented file (.env${envPathSuffix}) to indicate placeholders.`,
      }
    );

    error.notify(options.strict);

    return {
      error,
      parsed: undefined,
    };
  }

  validateGitIgnore(envPath, examplePath, options.strict);
  console.log(`✅ SafeEnv: ${envPath} validated successfully against ${examplePath}`);

  return { error: undefined, parsed: originalEnvParsed };
}

/**
 * Allows validating/loading multiple env files at once.
 */
export function configMultiple(configs: GuardianEnvConfig[] = []): GuardianEnvResults[] {
  return configs.map(cfg => config(cfg));
}

export default {
  config,
  configMultiple,
};
