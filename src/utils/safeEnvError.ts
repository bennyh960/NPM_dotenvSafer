import type { ErrorCode, ErrorContext } from './types.js';

export class SafeEnvError extends Error {
  code: ErrorCode;
  context?: ErrorContext;
  hint?: string;

  constructor(message: string, options: { context?: ErrorContext; hint?: string; code: ErrorCode }) {
    super(message);
    this.name = 'SafeEnvError';
    this.context = options?.context;
    this.hint = options?.hint;
    this.code = options?.code;
  }

  private color(text: string, code: number) {
    return `\x1b[${code}m${text}\x1b[0m`;
  }

  override toString(): string {
    const red = (s: string) => this.color(s, 31);
    const yellow = (s: string) => this.color(s, 33);
    const cyan = (s: string) => this.color(s, 36);
    const gray = (s: string) => this.color(s, 90);
    const bold = (s: string) => this.color(s, 1);

    const header = bold(red('❌ safeEnv Error:'));
    const msg = this.message;

    const code = `\n${gray('• Code:')} ${gray(this.code)}`;
    const context = this.context ? `\n${gray('• Context:')} ${cyan(this.context)}` : '';
    const hint = this.hint ? `\n${gray('💡 Hint:')} ${yellow(this.hint)}` : '';

    return `${header}\n${msg}${code}${context}${hint}\n`;
  }

  notify(strictMode?: boolean) {
    if (strictMode) {
      throw this;
    } else {
      const warning = this.toString().replace('❌ safeEnv Error:', '⚠️  safeEnv Warning: (strict mode = false) ');
      console.warn(warning);
    }
  }
}
