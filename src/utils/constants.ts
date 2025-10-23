export const errorCodeMap = {
  '000_400': 'Invalid env file path provided',
  '001_404': 'Env file not found',
  '002_404': 'Documented env file not found',
  '003_MISSING': 'Missing documented env variables',
  '004_UNDOCUMENTED': 'Undocumented env variables present',
  '005_SAME_VALUE': 'Env variables with same values as documented',
} as const;
