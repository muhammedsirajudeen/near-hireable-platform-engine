"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface NavbarProps {
    showLogo?: boolean;
}

const navItems = [
    {
        name: "Home",
        href: "/dashboard",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        name: "My PRD",
        href: "/prd",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
    },
];

export default function Navbar({ showLogo = true }: NavbarProps) {
    const { user, isAuthenticated, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        setShowDropdown(false);
        router.push("/");
    };

    return (
        <>
            {/* Desktop Top Navbar - hidden on mobile */}
            <nav className="bg-card border-b border-border hidden md:block">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        {showLogo && (
                            <Link href="/dashboard" className="flex items-center space-x-2">
                                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <span className="text-lg font-bold text-card-foreground">Near Hireable</span>
                            </Link>
                        )}

                        {/* Desktop Nav Links */}
                        {isAuthenticated && (
                            <div className="flex items-center space-x-1 mx-6">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                                    ? "bg-primary text-primary-foreground"
                                                    : "text-muted-foreground hover:bg-muted hover:text-card-foreground"
                                                }`}
                                        >
                                            <span className="w-5 h-5">{item.icon}</span>
                                            <span>{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}

                        {/* Right side - Profile */}
                        <div className="flex items-center space-x-4 ml-auto">
                            {isAuthenticated && user ? (
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-muted transition-colors"
                                    >
                                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/30">
                                            <span className="text-sm font-bold text-primary">
                                                {user.name?.charAt(0).toUpperCase() || "U"}
                                            </span>
                                        </div>
                                        <svg
                                            className={`w-4 h-4 text-muted-foreground transition-transform ${showDropdown ? "rotate-180" : ""}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {showDropdown && (
                                        <div className="absolute right-0 mt-2 w-64 bg-card rounded-xl shadow-xl border border-border py-2 z-50">
                                            <div className="px-4 py-3 border-b border-border">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <span className="text-sm font-bold text-primary">
                                                            {user.name?.charAt(0).toUpperCase() || "U"}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-card-foreground truncate">{user.name}</p>
                                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="pt-2">
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                    </svg>
                                                    <span>Logout</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    href="/signin"
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium"
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Navbar - visible only on mobile */}
            {isAuthenticated && (
                <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-50 safe-area-pb">
                    <div className="flex items-center justify-around h-16">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${isActive
                                            ? "text-primary"
                                            : "text-muted-foreground hover:text-card-foreground"
                                        }`}
                                >
                                    <span className={`${isActive ? "scale-110" : ""} transition-transform`}>
                                        {item.icon}
                                    </span>
                                    <span className="text-xs mt-1 font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                        {/* Profile/Logout for mobile */}
                        <button
                            onClick={handleLogout}
                            className="flex flex-col items-center justify-center flex-1 h-full text-muted-foreground hover:text-red-500 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="text-xs mt-1 font-medium">Logout</span>
                        </button>
                    </div>
                </nav>
            )}

            {/* Mobile Top Bar - simple header with logo and profile on mobile */}
            <div className="bg-card border-b border-border md:hidden">
                <div className="flex items-center justify-between px-4 h-14">
                    <Link href="/dashboard" className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="text-base font-bold text-card-foreground">Near Hireable</span>
                    </Link>
                    {isAuthenticated && user && (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/30">
                            <span className="text-xs font-bold text-primary">
                                {user.name?.charAt(0).toUpperCase() || "U"}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
