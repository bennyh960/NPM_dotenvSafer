import type { DotenvConfigOptions } from 'dotenv';
import type { errorCodeMap } from './constants.js';

type safeEnvCustomConfig = {
  pathSuffix?: string;
};

export type SafeEnvConfig = DotenvConfigOptions & safeEnvCustomConfig;

/** Result mimics Dotenv config return */
export interface SafeEnvResult {
  error?: Error;
  parsed?: Record<string, string>;
}

export type ErrorCode = keyof typeof errorCodeMap;
export type ErrorContext = (typeof errorCodeMap)[ErrorCode];
