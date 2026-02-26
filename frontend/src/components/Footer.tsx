import React from "react";
import { Link } from "@tanstack/react-router";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-charcoal border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand — logo image */}
          <div>
            <img
              src="https://fxcolonelpipsnetwork.com/logo-dark.png"
              alt="FX Colonel Pips Network"
              className="h-10 w-auto object-contain mb-3"
            />
            <p className="text-sm text-muted-foreground leading-relaxed">
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

        <div className="mt-8 pt-6 border-t border-border flex items-center justify-center">
          <p className="text-xs text-muted-foreground">
            © {year} FX Colonel Pips Network. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
