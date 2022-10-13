import { JwksClient } from 'jwks-rsa';
import { decode,verify, JwtPayload } from 'jsonwebtoken';

// extract and return the Bearer Token from the Lambda event parameters
const getToken = (params) => {
    if (!params.type || params.type !== 'TOKEN') {
        throw new Error('Expected "event.type" parameter to have value "TOKEN"');
    }

    const tokenString = params.authorizationToken;
    if (!tokenString) {
        throw new Error('Expected "event.authorizationToken" parameter to be set');
    }

    const match = tokenString.match(/^Bearer (.*)$/);
    if (!match || match.length < 2) {
        throw new Error(`Invalid Authorization token - ${tokenString} does not match "Bearer .*"`);
    }
    return match[1];
}

const client = new JwksClient({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10, // Default value
  jwksUri: process.env.JWKS_URI
});

const jwtOptions = {
  audience: process.env.AUDIENCE,
  issuer: process.env.TOKEN_ISSUER
};

const getPolicyDocument = (effect, resource) => {
  const policyDocument = {
      Version: '2012-10-17', // default version
      Statement: [{
          Action: 'execute-api:Invoke', // default action
          Effect: effect,
          Resource: resource,
      }]
  };
  return policyDocument;
}

export const authenticate = async (params) => {
    const token = getToken(params);

    const decoded = decode(token, { complete: true });
    if (!decoded || !decoded.header || !decoded.header.kid) {
        throw new Error('invalid token');
    }

    try{
      const key = await client.getSigningKey(decoded.header.kid);
      const signingKey = key.getPublicKey();
      const verifiedDecoded = verify(token, signingKey, jwtOptions);

      return {
        principalId: verifiedDecoded.sub,
        policyDocument: getPolicyDocument('Allow', params.methodArn),
        context: { scope: (verifiedDecoded as JwtPayload).scope }
    }

    } catch(error){
      throw error
    }
}
