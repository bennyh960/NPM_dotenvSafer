import type { DotenvConfigOptions } from 'dotenv';
import type { errorCodeMap } from './constants';
import type { EnvGuardianError } from './guardianError';

type guardianEnvCustomConfig = {
  pathSuffix?: string;
  strict?: boolean;
};

export type GuardianEnvConfig = DotenvConfigOptions & guardianEnvCustomConfig;

/** Result mimics Dotenv config return */
export interface GuardianEnvResults {
  error?: EnvGuardianError;
  parsed?: Record<string, string>;
}

export type ErrorCode = keyof typeof errorCodeMap;
export type ErrorContext = (typeof errorCodeMap)[ErrorCode];
