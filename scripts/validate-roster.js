import { readFile } from 'node:fs/promises';
import ROLE_CONFIG from '../src/roleConfig.js';
import { validateRoster } from '../src/rosterValidation.js';

const MEMBERS = JSON.parse(
  await readFile(new URL('../src/data/members.json', import.meta.url), 'utf8')
);
const METADATA = JSON.parse(
  await readFile(new URL('../src/data/rosterMetadata.json', import.meta.url), 'utf8')
);
const errors = validateRoster(MEMBERS, Object.keys(ROLE_CONFIG), METADATA);

if (errors.length > 0) {
  console.error(`Roster validation failed:\n${errors.map(error => `- ${error}`).join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`Roster validation passed (${MEMBERS.length} members, ${Object.keys(ROLE_CONFIG).length} roles).`);
}
