import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useQueryClient } from "@tanstack/react-query";
import { useIsAdmin } from "../hooks/useQueries";
import { Menu, X, Loader2 } from "lucide-react";

export default function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";
  const { data: isAdmin } = useIsAdmin();

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        if (error.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "API Reference", to: "/api-reference" },
    ...(isAdmin ? [{ label: "Dashboard", to: "/admin" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-charcoal/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand — text only, no logo/icon */}
          <Link to="/" className="flex items-center">
            <span className="font-serif text-xl font-bold text-gold tracking-wide">
              FX Colonel
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-foreground/80 hover:text-gold transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleAuth}
              disabled={isLoggingIn}
              className="px-4 py-1.5 rounded text-sm font-medium border border-gold text-gold hover:bg-gold hover:text-charcoal transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoggingIn && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isLoggingIn ? "Logging in…" : isAuthenticated ? "Logout" : "Login"}
            </button>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-foreground/80 hover:text-gold transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className="md:hidden overflow-hidden transition-all duration-300"
        style={{ maxHeight: mobileOpen ? "300px" : "0px" }}
      >
        <nav className="px-4 pb-4 flex flex-col gap-3 border-t border-border pt-3">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-foreground/80 hover:text-gold transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => {
              setMobileOpen(false);
              handleAuth();
            }}
            disabled={isLoggingIn}
            className="w-full px-4 py-2 rounded text-sm font-medium border border-gold text-gold hover:bg-gold hover:text-charcoal transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoggingIn && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isLoggingIn ? "Logging in…" : isAuthenticated ? "Logout" : "Login"}
          </button>
        </nav>
      </div>
    </header>
  );
}
