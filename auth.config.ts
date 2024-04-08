import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLogged = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLogged) {
          return true;
        } else {
          return false; // Redirect unauthenticated users to login page
        }
        // } else if (isLogged) {
        //   return Response.redirect(new URL('/dashboard', nextUrl));
        // }
      } else if (isLogged) {
        if (nextUrl.pathname.startsWith('/login')) {
          return Response.redirect(new URL('/dashboard', nextUrl));
        } else {
          return true;
        }
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
