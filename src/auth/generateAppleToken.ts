import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';

export const generateAppleToken = async () => {
  const appleTeamId = process.env.APPLE_TEAM_ID;
  const appleClientId = process.env.APPLE_CLIENT_ID;
  const appleKeyId = process.env.APPLE_KEY_ID;
  const algorithm: jwt.Algorithm = 'ES256';
  const now = Math.round(new Date().getTime() / 1000);
  const nowPlus20 = now + 1199;
  const pathFile = path.join(__dirname, '../../key.p8');
  const privateKey = fs.readFileSync(pathFile);

  const payload = {
    iss: appleTeamId,
    iat: now,
    exp: nowPlus20,
    aud: 'https://appleid.apple.com',
    sub: appleClientId,
  };

  const signOptions: jwt.SignOptions = {
    algorithm: algorithm,
    header: {
      alg: algorithm,
      kid: appleKeyId,
      typ: 'JWT',
    },
  };
  const token = jwt.sign(payload, privateKey.toString(), signOptions);
  return token;
};
