import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getMissingKeys } from './validate-env-lib';

const EXAMPLE_PATH = join(process.cwd(), '.env.example');
const ACTUAL_PATH = join(process.cwd(), '.env');

if (!existsSync(EXAMPLE_PATH)) {
    console.error('Error: .env.example not found');
    process.exit(1);
}

const exampleContent = readFileSync(EXAMPLE_PATH, 'utf-8');
const actualContent = existsSync(ACTUAL_PATH) ? readFileSync(ACTUAL_PATH, 'utf-8') : '';

const missing = getMissingKeys(exampleContent, actualContent);

if (missing.length > 0) {
    console.error('\x1b[31mError: Missing environment variables in .env:\x1b[0m');
    missing.forEach(key => console.error(`  - ${key}`));
    console.error('\nPlease update your .env file based on .env.example');
    process.exit(1);
} else {
    console.log('\x1b[32mEnvironment variables validation passed!\x1b[0m');
}
