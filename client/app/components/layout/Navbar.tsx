
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import WalletConnect from "./../WalletConnect";

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="fixed w-full z-50 ">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-8 py-5 text-white">
        {/* Logo */}
        <div className="text-2xl font-bold tracking-wide">
          <Link 
            href="/" 
            className="hover:text-green-400 transition-colors duration-200"
          >
            Privance
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-10 text-gray-200 font-medium">
          <Link 
            href="/" 
            className={`relative hover:text-green-400 transition-colors duration-200 pb-1 ${
              isActive("/") ? "text-green-400" : ""
            }`}
          >
            Home
            {isActive("/") && (
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-green-400 rounded-full"></span>
            )}
          </Link>
          
          <Link 
            href="/borrow" 
            className={`relative hover:text-green-400 transition-colors duration-200 pb-1 ${
              isActive("/borrow") ? "text-white" : ""
            }`}
          >
            Borrow
            {isActive("/borrow") && (
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-green-400 rounded-full"></span>
            )}
          </Link>
          
          <Link 
            href="/lender" 
            className={`relative hover:text-green-400 transition-colors duration-200 pb-1 ${
              isActive("/lender") ? "text-white" : ""
            }`}
          >
            Lender
            {isActive("/lender") && (
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-green-400 rounded-full"></span>
            )}
          </Link>
          
          <Link
            href="/how-it-works"
            className={`relative hover:text-green-400 transition-colors duration-200 pb-1 ${
              isActive("/how-it-works") ? "text-white" : ""
            }`}
          >
            How It Works
            {isActive("/how-it-works") && (
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-green-400 rounded-full"></span>
            )}
          </Link>
        </div>

        {/* Connect Wallet */}
        <div className="ml-6">
          <WalletConnect />
        </div>
      </div>
    </nav>
  );
}