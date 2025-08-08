// components/Auth0ClientProvider.jsx
"use client";

import { Auth0Provider } from "@auth0/auth0-react";

export default function Auth0ClientProvider({ children }) {
  // Use full URL including query params for redirect_uri
  const redirectUri = typeof window !== "undefined" ? window.location.href : "";

  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN}
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: redirectUri,
      }}
    >
      {children}
    </Auth0Provider>
  );
}
