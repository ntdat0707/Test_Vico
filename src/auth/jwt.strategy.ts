import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthPayload } from './payload';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_PUBLIC_KEY,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: AuthPayload, done: Function) {
    try {
      // You could add a function to the authService to verify the claims of the token:
      // i.e. does the user still have the roles that are claimed by the token
      const validClaims = await this.authService.verifyTokenClaims(payload);

      if (!validClaims) return done(new UnauthorizedException('INVALID_TOKEN'), false);

      done(null, payload);
    } catch (err) {
      throw new UnauthorizedException('UNAUTHORIZED', err.message);
    }
  }
}
