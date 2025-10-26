# Dotenv-Guardian

A minimal, TypeScript-first library built as an extension of
[dotenv](https://www.npmjs.com/package/dotenv) , adding validation and documentation checks for your
environment files (.env), so your Node.js apps stay safe and **the missing validation layer for
Node.js apps**.

---

## 🚀 Features

- **Strict validation:** Ensures all documented variables (`.env.example`) exist in the actual
  `.env` file and vice versa.
- **Mistake detection:** Flags undocumented, missing, or identical-value variables.
- **Dotenv-compatible:** Uses original `dotenv.config({ ... })` for seamless adoption in existing
  projects.
- **Zero dependencies:** Only relies on `dotenv` and Node.js core modules.
- **TypeScript-native:** Provides strong types and full autocomplete in editors.
- **Strict mode:** Optional mode to throw errors or exit the process if validation fails.
- **Gitignore validation:** Ensures `.env` is ignored in Git while `.env.example` is included,
  helping teams avoid committing secrets.

---

## 📦 Installation

```bash
npm install dotenv-guardian
# or
yarn add dotenv-guardian
```

## 🛠️ Usage

### Before you start

- Place your `.env` and `.env.example` files in your project root.
- Ensure you have a `.gitignore` file:
  - Add your `.env` file to `.gitignore`.
  - Do **not** include `.env.example` in `.gitignore`.

> For convenience, the default file names are `.env` and `.env.example`, but you can use custom
> names if desired.

### Basic validation (TypeScript or CommonJS)

```typescript
import { config } from 'dotenv-guardian';
// or: const { config } = require('dotenv-guardian');

const result = config({ path: './.env' });

if (result.error) {
  throw result.error;
}

// result.parsed contains your validated environment variables
```

### Multi-file validation

```typescript
import { configMultiple } from 'dotenv-guardian';

const results = configMultiple([{ path: './.env' }, { path: './.db.env' }]);
```

### Custom paths

- By default, validates `.env` and `.env.example`.
- You can set a custom path to validate files like `./.backend.env` and `./.backend.env.example`.

---

## 🧪 API Reference

### DotenvConfigOptions & GuardianEnvConfig

- GuardianEnvConfig inherits all original `DotenvConfigOptions` options from `dotenv` package.
- Adds custom variables:
  - `pathSuffix: string` — Specify your documented env file name, e.g., `.env.docs` or
    `.env.template`. (Default: `.example`)
  - `strict: boolean` — Default: `false`. If `true`, validation errors will throw instead of
    returning them.

### `config(options?: GuardianEnvConfig): GuardianEnvResults`

- **options.path:** Path to your env file (e.g., `.env`, `.redis.env`, etc.)
- **returns:** `{ error?: GuardianEnvError, parsed?: Record<string, string> }`

### `configMultiple(configs: GuardianEnvConfig[]): GuardianEnvResults[]`

- Validates multiple env files and returns an array of results, one for each configuration.

## 🔍 What does it check?

1. <b>Missing vars:</b> Is every variable in .env.example present in your .env?
2. <b>Undocumented vars:</b> Is every real var documented in .env.example?
3. <b>Duplicate values:</b> Does any documented variable have the same value in both files? (Helps
   catch copy-pasting errors.)
4. <b>gitignore validation:</b> If your original env file is in gitignore and your document env file
   is not.

---

## 💡 Example .env and .env.example

### .env

```unknown
DB_USER=admin
DB_PASS=hunter2
SECRET_KEY=productionsecret123
```

### .env.example

```unknown
DB_USER=sample
DB_PASS=sample
SECRET_KEY=changeme
```

If .env and .env.example match except for values, you pass. If any variable is missing or present in
only one file, or shares a value, you get a clear error.

---

### ✅ CI Integration

Add to your .github/workflows/ci.yml:

```yaml
- name: Validate environment files
  run: node -e "require('dotenv-guardian').config({ path: './.env' })"
```

---

## 🔄 Migrating from dotenv

- Drop-in replacement: swap dotenv.config() for dotenv-guardian.config().
- Extends validation with minimal code change.

---

## 👀 Contributing & Issues

PRs, bug reports, and feature requests are welcome! Open an issue describing your use-case, or send
a PR.

---

### 📄 License

MIT
