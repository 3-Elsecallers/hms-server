import * as jose from 'jose';
import "dotenv/config";
import { IUserPayload } from '../types/custom';

const ISSUER = 'https://your-hms-api.com';
const AUDIENCE = 'hms-services';
const ALGORITHM = 'RS256';
const KID = 'hms-key-001'; // Matches the 'kid' in your JWKS

export class AuthUtils {
  private static privateKey: jose.CryptoKey;

  private static async getPrivateKey() {
    if (!this.privateKey) {
      this.privateKey = await jose.importPKCS8(process.env.PRIVATE_KEY_PEM!, ALGORITHM);
    }
    return this.privateKey;
  }

  static async generateAccessToken(payload: IUserPayload) {
    const key = await this.getPrivateKey();
    return await new jose.SignJWT({
      realm_access: { roles: [payload.role] }, // Standard path for EHRBase
      data: payload
    })
      .setProtectedHeader({ alg: ALGORITHM, kid: KID })
      .setIssuedAt()
      .setIssuer(ISSUER)
      .setAudience(AUDIENCE)
      .setSubject(payload.id)
      .setExpirationTime('15m') // Short life
      .sign(key);
  }

  static async generateRefreshToken(payload: IUserPayload) {
    const key = await this.getPrivateKey();
    return await new jose.SignJWT({ data: payload })
      .setProtectedHeader({ alg: ALGORITHM, kid: KID })
      .setIssuedAt()
      .setIssuer(ISSUER)
      .setSubject(payload.id)
      .setExpirationTime('7d') // Long life
      .sign(key);
  }

  static async verifyToken(token: string) {
    const publicKey = await jose.importSPKI(process.env.PUBLIC_KEY_PEM!, ALGORITHM);
    const { payload } = await jose.jwtVerify(token, publicKey, {
      issuer: ISSUER,
    });
    return payload;
  }
}