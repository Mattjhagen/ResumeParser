import { Strategy as SamlStrategy, Profile } from "passport-saml";

// You must replace these with your actual SAML Identity Provider configuration.
// It's strongly recommended to use environment variables for sensitive data.
const samlConfig = {
  // The URL where the SAML request should be sent (your IdP's SSO URL).
  entryPoint: "https://your-idp.com/sso",
  // The issuer string to identify your service provider (this application).
  issuer: "vibecodes.space",
  // The callback URL where the IdP will send the SAML assertion.
  // This must match the URL registered with your IdP.
  // For production, this would be something like 'https://vibecodes.space/api/auth/saml/callback'
  callbackUrl: "http://localhost:5000/api/auth/saml/callback",
  // The public X.509 certificate from your IdP to verify assertion signatures.
  // Replace this with the actual certificate content.
  cert: "YOUR_IDP_CERTIFICATE",
};

export const samlStrategy = new SamlStrategy(
  {
    entryPoint: samlConfig.entryPoint,
    issuer: samlConfig.issuer,
    cert: samlConfig.cert,
    callbackUrl: samlConfig.callbackUrl,
  },
  (profile: Profile | null | undefined, done: (err?: Error | null, user?: object) => void) => {
    if (!profile) {
      return done(new Error("No profile found in SAML response."));
    }
    // The 'profile' object contains user attributes from the IdP.
    // You could find or create a user in your database here.
    // For now, we'll pass the profile as the user object.
    return done(null, {
      id: profile.nameID,
      email: profile.email || profile.nameID,
      name: profile.displayName || `${profile.givenName} ${profile.sn}`,
      ...profile,
    });
  }
);
