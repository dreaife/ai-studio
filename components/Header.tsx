"use client";

import { useAuth } from "react-oidc-context";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const auth = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const signOutRedirect = () => {
    const clientId = "243sbg9feal566d63g036q1dhv";
    const logoutUri = "http://localhost:3000/login";
    const cognitoDomain = "https://bgm-angular-login.auth.ap-northeast-1.amazoncognito.com";

    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;

    sessionStorage.removeItem("oidc.user:https://cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-1_aKEXP7GNF:243sbg9feal566d63g036q1dhv");
  };

  const handleTitleClick = () => {
    router.push('/');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 
            className="text-xl font-bold cursor-pointer hover:text-blue-600"
            onClick={handleTitleClick}
          >
            Gemini AI Assistant
          </h1>
          
          {auth.isAuthenticated && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 hover:bg-gray-100 px-3 py-2 rounded-lg"
              >
                <span>{auth.user?.profile.email}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                  <button
                    onClick={() => signOutRedirect()}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}