#!/usr/bin/env node
import fs from 'node:fs';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import {clientAssertion} from './lib/commands/client-assertion.js';
import {signJWT} from './lib/commands/sign-jwt.js';

const packageJson = JSON.parse(
  fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
);

const argv = yargs(hideBin(process.argv))
  .version(packageJson.version)
  .command(
    'client-assertion',
    'Create a signed JWT to use as the client assertion for the OAuth token post',
  )
  .demandCommand(1)
  .option('client-id', {
    demandOption: true,
    describe: 'client id to use for the OAuth token flow',
    type: 'string',
  })
  .option('private-key', {
    demandOption: true,
    describe: 'Path to the PEM encoded private key used to sign the assertion',
    type: 'string',
  })
  .command(
    'sign-jwt',
    'Only create a signed JWT for use with the Banno back office OAuth flow',
  )
  .strict()
  .help().argv;

switch (argv._[0].toString().toLowerCase()) {
  case 'client-assertion':
    clientAssertion(argv['client-id'], argv['private-key']).catch((e) =>
      console.error(e),
    );
    break;
  case 'sign-jwt':
    signJWT(argv['client-id'], argv['private-key']).catch((e) =>
      console.error(e),
    );
    break;
  default:
    break;
}
