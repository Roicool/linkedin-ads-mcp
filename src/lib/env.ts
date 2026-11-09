/**
 * Loads .env from the project root (next to package.json), not from the process working
 * directory, so the server finds its credentials however the MCP client launches it.
 * Variables already set in the environment take precedence.
 */
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import * as path from 'path';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
// quiet: dotenv 17 logs to stdout by default, which would corrupt the MCP stdio stream
config({ path: path.join(projectRoot, '.env'), quiet: true });
