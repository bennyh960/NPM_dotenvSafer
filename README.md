# safe-env-validator

A minimal, TypeScript-first validator and loader for environment files (`.env`) inspired by
[dotenv](https://www.npmjs.com/package/dotenv), ensuring your environment variables are documented
and safe—**the missing validation layer for Node.js apps**.

---

## 🚀 Features

- **Strict validation:** Ensures all documented vars (`.env.example`) are present in real `.env`
  file.
- **Detects mistakes:** Flags undocumented, missing, and identical-value variables.
- **Dotenv-compatible:** Mimics `dotenv.config({ ... })` for seamless adoption.
- **Zero dependencies:** Only relies on `dotenv` and Node.js core modules.
- **TypeScript-native:** Strong types, full autocomplete in editors.

---

## 📦 Installation

```bash
npm install safe-env-validator dotenv
# or
yarn add safe-env-validator dotenv
```

## 🛠️ Usage

### Basic validation (TypeScript or CommonJS)

```typescript
import { config } from 'safe-env-validator';
// or: const { config } = require('safe-env-validator');

const result = config({ path: './.env' });

if (result.error) {
  throw result.error;
}
// result.parsed is your validated env variables.
```

### Multi-file validation

```typescript
import { configMultiple } from 'safe-env-validator';

const results = configMultiple([{ path: './.env' }, { path: './.db.env' }]);
```

### Custom paths

- By default, validates .env and .env.example.
- Set path to validate ./.backend.env and ./.backend.env.example, etc.

---

## 🧪 API Reference

### SafeEnvConfig

- same as original SafeEnvConfig
- extend custom variables :
- pathSuffix: string , keep your desired env doc name such as .env.docs or .env.template etc...
  (default : .example)

### config(options?: SafeEnvConfig): SafeEnvResult

- <b>options.path:</b> Path to your env file (.env, .redis.env, etc.)
- <b>returns:</b> { error?: Error, parsed?: Record<string, string> }

### configMultiple(configs: SafeEnvConfig[]): SafeEnvResult[]

- Validates and returns results for each config in array.

---

## 🔍 What does it check?

1. <b>Missing vars:</b> Is every variable in .env.example present in your .env?
2. <b>Undocumented vars:</b> Is every real var documented in .env.example?
3. <b>Duplicate values:</b> Does any documented variable have the same value in both files? (Helps
   catch copy-pasting errors.)

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
  run: node -e "require('safe-env-validator').config({ path: './.env' })"
```

---

## 🔄 Migrating from dotenv or dotenv-safe

- Drop-in replacement: swap dotenv.config() for safe-env-validator.config().
- Extends validation with minimal code change.

---

## 👀 Contributing & Issues

PRs, bug reports, and feature requests are welcome! Open an issue describing your use-case, or send
a PR.

---

### 📄 License

MIT
