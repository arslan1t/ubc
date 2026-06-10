import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    // Google OAuth is optional. Fall back to non-empty placeholders so the
    // app boots even when GOOGLE_* env vars are not configured — passport
    // throws on empty clientID/secret. The /auth/google route stays inert
    // until real credentials are provided.
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID') || 'google-not-configured',
      clientSecret:
        config.get<string>('GOOGLE_CLIENT_SECRET') || 'google-not-configured',
      callbackURL:
        config.get<string>('GOOGLE_CALLBACK_URL') ||
        'http://localhost:4000/api/v1/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const { id, name, emails, photos } = profile;
    done(null, {
      googleId: id,
      email: emails?.[0]?.value ?? null,
      firstName: name?.givenName ?? '',
      lastName: name?.familyName ?? '',
      avatarUrl: photos?.[0]?.value ?? null,
    });
  }
}
