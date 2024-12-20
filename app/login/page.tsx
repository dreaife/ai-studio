"use client";

import { useAuth } from "react-oidc-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.isAuthenticated) {
      router.push("/");
    }
  }, [auth.isAuthenticated, router]);

  const signOutRedirect = () => {
    const clientId = "243sbg9feal566d63g036q1dhv";
    const logoutUri = "http://localhost:3000";
    const cognitoDomain = "https://bgm-angular-login.auth.ap-northeast-1.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>loading...</div>
      </div>
    );
  }

  if (auth.error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>error: {auth.error.message}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold mb-4">login</h1>
      {auth.isAuthenticated ? (
        <div className="flex flex-col items-center gap-4">
          <div>logged in as: {auth.user?.profile.email}</div>
          <button
            onClick={() => auth.removeUser()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            logout
          </button>
        </div>
      ) : (
        <div className="flex gap-4">
          <button
            onClick={() => auth.signinRedirect()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            login
          </button>
          <button
            onClick={() => signOutRedirect()}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            logout
          </button>
        </div>
      )}
    </div>
  );
} 