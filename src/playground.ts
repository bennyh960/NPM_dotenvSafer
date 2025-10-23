// ! IMPORTANT:
/***
 * This playground file is for testing purposes only. - its auto remove from the deployed package.
 * Before deploy new version with `npm run deploy` we need to test the package locally from node modules : using `npm run deployLocal`
 * this command will build the package and copy it to the local node_modules so we can do the import: `import { config } from 'dotenv-safer'`
 *
 * ? Before run `npm run deploy` make sure you did run `npm run deployLocal` and test the package locally.
 * ? we have safety check in the deploy script to prevent accidental deploy without local testing.
 * */
//
//   :

import { config } from 'dotenv-safer';
config({ strict: true });
