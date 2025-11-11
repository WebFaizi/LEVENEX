'use client';

import Link from "next/link";
import { FileQuestion, Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-16">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* 404 Icon and Number */}
        <div className="relative">
          <div className="flex items-center justify-center">
            <FileQuestion className="w-24 h-24 text-gray-300 absolute" strokeWidth={1} />
            <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              404
            </h1>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Oops! The page you're looking for doesn't exist or has been moved. 
            Let's get you back on track.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg shadow-md hover:shadow-lg border border-gray-200 transform hover:scale-105 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Popular Links */}
        <div className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Popular pages you might be looking for:</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Home
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/about"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              About Us
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/contact"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Contact
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/laptop-rentals"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Laptop Rentals
            </Link>
          </div>
        </div>

        {/* Search Suggestion */}
        <div className="pt-4">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <Search className="w-4 h-4" />
            Try searching for what you need from the homepage
          </p>
        </div>
      </div>
    </div>
  );
}
