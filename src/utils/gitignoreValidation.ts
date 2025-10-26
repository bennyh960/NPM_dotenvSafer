import fs from 'fs';
import path from 'path';
import { EnvGuardianError } from './guardianError.js';
import { errorCodeMap } from './constants.js';

export function validateGitIgnore(envPath: string, examplePath: string, strict: boolean = true): void {
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    const error = new EnvGuardianError('.gitignore file not found', {
      code: '015_GITIGNORE_MISSING',
      context: errorCodeMap['015_GITIGNORE_MISSING'] ?? 'No .gitignore file found in project root',
      hint: 'Create a .gitignore file to manage ignored files in your repository.',
    });
    error.notify(strict);
    if (!strict) {
      return;
    }
  } // optional: no gitignore file

  const lines = fs
    .readFileSync(gitignorePath, 'utf-8')
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  // Basic pattern check
  const hasBroadEnvRule = lines.some(line => /^\.env\*/.test(line));

  if (hasBroadEnvRule) {
    const error = new EnvGuardianError(`The .gitignore pattern '.env*' is too broad and ignores both ${envPath} and ${examplePath}.`, {
      code: '008_ENV_PATTERN_TOO_BROAD',
      context: errorCodeMap['008_ENV_PATTERN_TOO_BROAD'] ?? 'Overly broad .env* pattern in .gitignore',
      hint: "Use a more specific pattern like '.env' instead of '.env*' so your documented env file remains tracked.",
    });
    error.notify(strict);
    return;
  }

  const isIgnored = (file: string) => {
    return lines.some(line => {
      if (line.endsWith('/')) line = line.slice(0, -1); // ignore folder slash
      return line === path.basename(file) || file.endsWith(line);
    });
  };

  const envIgnored = isIgnored(envPath);
  const exampleIgnored = isIgnored(examplePath);

  // Validate .env is ignored
  if (!envIgnored) {
    const error = new EnvGuardianError(`${envPath} should be in .gitignore`, {
      code: '006_ENV_NOT_IGNORED',
      context: errorCodeMap['006_ENV_NOT_IGNORED'] ?? 'Env file should be ignored by git',
      hint: 'Add your .env file to .gitignore to avoid committing secrets.',
    });

    error.notify(strict);
  }

  // Validate .env.example is NOT ignored
  if (exampleIgnored) {
    const error = new EnvGuardianError(`${examplePath} should NOT be in .gitignore`, {
      code: '007_EXAMPLE_IGNORED',
      context: errorCodeMap['007_EXAMPLE_IGNORED'] ?? 'Documented env file should not be ignored',
      hint: 'Remove the example file from .gitignore so it can be committed.',
    });

    error.notify(strict);
  }
}
