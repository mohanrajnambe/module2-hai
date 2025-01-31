import { Request, Response, NextFunction } from "express";
import { ConfidentialClientApplication } from "@azure/msal-node";
import jwt, { JwtPayload } from 'jsonwebtoken';
import jwksClient, { JwksClient, SigningKey } from 'jwks-rsa';

const clientId = process.env.AZURE_AD_CLIENT_ID;
const authority = `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}`;
const clientSecret = process.env.AZURE_AD_CLIENT_SECRET;

if (!clientId || !authority || !clientSecret) {
  throw new Error("Azure AD configuration is invalid. Please check environment variables.");
}

const msalConfig = {
  auth: {
    clientId,
    authority,
    clientSecret,
  },
};

const cca = new ConfidentialClientApplication(msalConfig);

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("Authorization header missing");
  }

  const tokenParts = authHeader.split(" ");
  if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
    return res.status(401).send("Invalid authorization header format");
  }
  const token = tokenParts[1];
  try {
    const tokenResponse = await cca.acquireTokenOnBehalfOf({
      oboAssertion: token,
      scopes: ["User.Read"],
    });
    if (tokenResponse && tokenResponse.account) {
      next();
    } else {
      res.status(401).send("Invalid token");
    }
  } catch (error) {
    res.status(401).send("Invalid token");
  }
};

// Configure the JWKS client
const client: JwksClient = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/discovery/keys?appid=${clientId}`
});

const getSigningKey = (header: any, callback: (err: any, key?: SigningKey) => void): void => {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
};

// Middleware to verify Azure AD token
const verifyAzureToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Verify the token
    jwt.verify(
      token,
      getSigningKey,
      {
        audience: clientId,
        issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
        algorithms: ['RS256']
      },
      (err: Error | null, decoded: JwtPayload | undefined) => {
        if (err) {
          res.status(401).json({ message: 'Invalid token', error: err.message });
          return;
        }

        // Add the decoded token to the request object
        req.user = decoded as JwtPayload;
        next();
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Error verifying token', error: (error as Error).message });
  }
};

export default verifyAzureToken;
