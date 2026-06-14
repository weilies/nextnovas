import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Google sign-in. trustHost lets it work behind the custom domain on Vercel.
// Provider credentials come from AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET (or GOOGLE_*).
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
});
