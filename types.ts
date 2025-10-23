import type { DotenvConfigOptions } from 'dotenv';

type safeEnvCustomConfig = {
  pathSuffix?: string;
};

export type SafeEnvConfig = DotenvConfigOptions & safeEnvCustomConfig;

/** Result mimics Dotenv config return */
export interface SafeEnvResult {
  error?: Error;
  parsed?: Record<string, string>;
}
