import crypto from 'crypto';
import fs from 'fs/promises';
import chalk from 'chalk';
import {SignJWT} from 'jose';
import {v4 as uuid} from 'uuid';

export default async function signJWT(clientId, privateKeyPath) {
    // Obtain an access token to call banno apis
    const enterpriseOidcTokenUri = 'https://banno.com/a/oidc-provider/api/v0/token';

    const jwtPayload = {
      jti: uuid(),
      aud: enterpriseOidcTokenUri,
      sub: clientId,
      iss: clientId,
      exp: Date.now() + 60 * 1000
    };

    process.stdout.write(`${chalk.green('Client JWT payload:')} ${JSON.stringify(jwtPayload, null, 2)}\n`);

    const privateKeyContents = await fs.readFile(privateKeyPath, {encoding: 'utf8'});
    const privateKey = crypto.createPrivateKey({
      key: privateKeyContents,
      format: 'pem',
      encoding: 'utf8'
    });

    /** @type {string} */
    const clientAssertion = await new SignJWT(jwtPayload)
        .setProtectedHeader({ alg: 'PS256' })
        .sign(privateKey);

    process.stdout.write(`${chalk.green('Signed client JWT:')} ${clientAssertion}\n`);
    process.stdout.write(chalk.grey('\nYou can inspect the JWT at ') + chalk.underline.yellow('https://jwt.io/') + '\n\n')

    return(clientAssertion)
}
