"use client";

import React from "react";

export default function LoginFunction() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form className="bg-white p-10 rounded shadow-md w-96">
        {/* <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">Login</h2> */}
        <div className="mb-6">
        <p>Name</p>
          
          <input
            type="text"
            name="username"
            // placeholder="Username"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div className="mb-6">
            <p>Password</p>
          <input
            type="password"
            name="password"
            // placeholder="Password"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}
