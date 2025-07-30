"use client";

import { Auth0Provider } from "@auth0/auth0-react";

export default function Auth0ClientProvider({ children }) {
  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN}
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri:
          process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI ||
          (typeof window !== "undefined" ? window.location.origin : ""),
      }}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
}
