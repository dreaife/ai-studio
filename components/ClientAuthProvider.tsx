"use client";

import { AuthProvider } from "react-oidc-context";
import { ReactNode, useEffect, useState } from "react";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-1_aKEXP7GNF",
  client_id: "243sbg9feal566d63g036q1dhv",
  redirect_uri: "http://localhost:3000",
  response_type: "code",
  scope: "email openid phone",
  loadUserInfo: true,
  onSigninCallback: () => {
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );
  },
};

export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen">Loading...</div>;
  }

  return (
    <AuthProvider {...cognitoAuthConfig}>
      {children}
    </AuthProvider>
  );
} 