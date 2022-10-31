import chalk from 'chalk';
import querystring from 'querystring';
import fetch from 'node-fetch';
import signJWT from './sign-jwt.js';

export default async function clientAssertion(clientId, privateKeyPath) {
  // Obtain an access token to call banno apis
  const enterpriseOidcTokenUri = 'https://banno.com/a/oidc-provider/api/v0/token';

  clientAssertion = await signJWT(clientId, privateKeyPath)

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
