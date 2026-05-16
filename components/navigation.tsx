"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthUtils } from "@/lib/auth";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status on component mount and when localStorage changes
    const checkAuth = () => {
      setIsAuthenticated(AuthUtils.isAuthenticated());
    };

    checkAuth();

    // Listen for storage changes (login/logout from other tabs)
    const handleStorageChange = () => {
      checkAuth();
    };

    // Listen for custom auth change events (for same-tab login/logout)
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/products", label: "Products" },
    { href: "/projects", label: "Projects" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            {/* <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
              AE
            </div> */}
            <span className="font-semibold text-foreground hidden sm:inline group-hover:text-primary transition-colors">
              Air Current Engineering Solution
            </span>
          </Link>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-secondary transition-colors rounded-md"
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <Link
                  href="/admin"
                  className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-secondary transition-colors rounded-md"
                >
                  Dashboard
                </Link>
              )}
            </div>
            <Button
              asChild
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Link href="/inquiries">Get Quote</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-secondary focus:outline-none transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary hover:bg-secondary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                href="/admin"
                className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary hover:bg-secondary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Admin Dashboard
              </Link>
            )}
            <div className="px-3 py-2">
              <Button
                asChild
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Link href="/contact">Get Quote</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
