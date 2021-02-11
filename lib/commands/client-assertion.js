import jose from 'node-jose';
import {v4 as uuid} from 'uuid';
import chalk from 'chalk';
import fs from 'fs';
import querystring from 'querystring';
import fetch from 'node-fetch';

export default async function clientAssertion(clientId, privateKeyPath) {
  // Obtain an access token to call banno apis
  const enterpriseOidcTokenUri = 'https://banno.com/a/oidc-provider/api/v0/token';
  
  const jwtPayload = {
    jti: uuid(),
    aud: enterpriseOidcTokenUri,
    sub: clientId,
    iss: clientId,
    exp: Date.now() + 60 * 1000
  };

  process.stdout.write(`${chalk.green('Client assertion payload:')} ${JSON.stringify(jwtPayload, null, 2)}\n`);

  const privateKey = await fs.promises.readFile(privateKeyPath, {encoding: 'utf8'});

  const jwkKeystore = jose.JWK.createKeyStore();
  await jwkKeystore.add(privateKey, 'pem');
  const jwkKey = jwkKeystore.all({use: 'sig', alg: 'PS256'})[0];
  
  /** @type {string} */
  const clientAssertion =
    /** @type {*} */ (await jose.JWS.createSign({format: 'compact'}, /** @type {*} */ (jwkKey))
        .update(JSON.stringify(jwtPayload))
        .final());

  process.stdout.write(`${chalk.green('Signed client assertion:')} ${clientAssertion}\n`);
  process.stdout.write(chalk.grey('You can inspect the assertion at https://jwt.io/') + '\n\n');

  const tokenPayload = {
    client_assertion: clientAssertion,
    client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
    grant_type: 'client_credentials',
    scope: 'openid full'
  };
  process.stdout.write(`To obtain an access token, make a POST to the ${chalk.yellow('https://banno.com/a/oidc-provider/api/v0/token')} endpoint.
Include a content-type header of ${chalk.yellow('application/x-www-form-urlencoded')}.
${chalk.green('Request body:')}
${querystring.stringify(tokenPayload)}
`);

  fetch(enterpriseOidcTokenUri, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    body: querystring.stringify(tokenPayload)
  }).then((res) => {
    if (!res.ok) {
      process.stderr.write(`${chalk.red('Token POST error: ' + res.status)} ${JSON.stringify(res.headers.raw, null, 2)}\n`);
      console.log(res.headers);
    }
    return res.json();
  }).then((data) => {
    process.stdout.write(`
${chalk.green('Token POST response:')} ${JSON.stringify(data, null, 2)}
`)
  });
};
