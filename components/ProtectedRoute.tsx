"use client";

import { useAuth } from "react-oidc-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!auth.isLoading) {
      setIsInitialized(true);
    }
  }, [auth.isLoading]);

  useEffect(() => {
    if (isInitialized && !auth.isAuthenticated && !auth.isLoading) {
      router.push("/login");
    }
  }, [auth.isAuthenticated, auth.isLoading, isInitialized, router]);

  if (!isInitialized || auth.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>loading...</div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return null;
  }

  return <>{children}</>;
} 