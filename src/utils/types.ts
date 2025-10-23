import type { DotenvConfigOptions } from 'dotenv';
import type { errorCodeMap } from './constants.js';
import type { SafeEnvError } from './safeEnvError.js';

type safeEnvCustomConfig = {
  pathSuffix?: string;
};

export type SafeEnvConfig = DotenvConfigOptions & safeEnvCustomConfig;

/** Result mimics Dotenv config return */
export interface SafeEnvResult {
  error?: SafeEnvError;
  parsed?: Record<string, string>;
}

export type ErrorCode = keyof typeof errorCodeMap;
export type ErrorContext = (typeof errorCodeMap)[ErrorCode];
