import React from "react";
import { Link } from "react-router-dom";

export default function Expired() {
  return (
    <div className="min-h-screen bg-mustard flex flex-col">
      <nav className="h-12 bg-gray-900 text-white flex items-center justify-end px-6">
        <div className="space-x-6">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/goto" className="hover:underline">Go to URL</Link>
          <a className="hover:underline" href="#">About Us</a>
          <a className="hover:underline" href="#">Terms &amp; Conditions</a>
        </div>
      </nav>

      <header className="flex-1 flex items-start justify-center p-12">
        <div className="w-full max-w-3xl text-center">
          <h1 className="text-[6rem] font-cursive text-gray-900 leading-tight mb-8">Domain Expired</h1>
          <div className="mx-auto bg-white rounded-xl p-8 shadow-md w-2/3">
            <div className="text-6xl mb-4">⏰</div>
            <h2 className="text-2xl font-semibold mb-2">This clipboard domain has expired</h2>
            <p className="text-gray-600 mb-6">
              Sorry, this Sendy.in domain is no longer accessible.<br/>
              Please create a new domain or return to the homepage.
            </p>
            <Link to="/" className="px-6 py-3 bg-green-600 text-white rounded-md inline-block mr-2">
              Go Home
            </Link>
            <a href="#" className="px-6 py-3 bg-cyan-400 text-white rounded-md inline-block">How it works?</a>
          </div>
        </div>
      </header>
    </div>
  );
}