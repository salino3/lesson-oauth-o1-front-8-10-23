import passportGoogle from 'passport-google-oauth20';
import { envConstants } from '../env.constants';
import { User, profileRepository } from '../dals';


const googleStrategy = passportGoogle.Strategy;

export const configPassport = function (passport: any) {
  passport.use(
    new googleStrategy(
      {
        clientID: envConstants.GOOGLE_CLIENT_ID,
        clientSecret: envConstants.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        const sessionExists = await profileRepository.userProfileExists(
          profile.id
        );

        if (sessionExists) {
          const user = await profileRepository.getUserByGoogleId(profile.id);
          done(null, user);
        } else {
          let user: User = {
            id: -1,
            googleId: profile.id,
            displayName: profile.displayName,
            firstName: profile.name.givenName,
            secondName: profile.name.familyName,
            image: profile.photos[0].value,
            email: profile.emails[0].value,
          };

          user = await profileRepository.addNewUser(user);
          done(null, user);
        }
      }
    )
  );
};
