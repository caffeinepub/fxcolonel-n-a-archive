import React from "react";
import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(
    typeof window !== "undefined" ? window.location.hostname : "fx-colonel"
  );

  return (
    <footer className="bg-charcoal border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand — text only */}
          <div>
            <span className="font-serif text-lg font-bold text-gold">FX Colonel</span>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Premium forex analysis and market insights for serious traders.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
              Navigation
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-sm text-muted-foreground hover:text-gold transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/api-reference"
                  className="text-sm text-muted-foreground hover:text-gold transition-colors"
                >
                  API Reference
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
              Disclaimer
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Trading forex involves significant risk. Past performance is not indicative
              of future results. Always trade responsibly.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {year} FX Colonel. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Built with{" "}
            <Heart className="w-3 h-3 text-gold fill-gold" />{" "}
            using{" "}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
