import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GoToUrl = () => {
  const [domain, setDomain] = useState('');
  const navigate = useNavigate();

  const handleGo = (e) => {
    e.preventDefault();
    if (domain.trim()) {
      navigate(`/${domain.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-mustard flex flex-col">
      <nav className="h-12 bg-gray-900 text-white flex items-center justify-end px-6">
        <div className="space-x-6">
          <a className="hover:underline" href="#">Home</a>
          <a className="hover:underline" href="/goto">Go to URL</a>
          <a className="hover:underline" href="#">About Us</a>
          <a className="hover:underline" href="#">Terms &amp; Conditions</a>
        </div>
      </nav>
      <header className="flex-1 flex items-start justify-center p-12">
        <div className="w-full max-w-3xl text-center">
          <h1 className="text-[4rem] font-cursive text-gray-900 leading-tight mb-8">Go to Your URL</h1>
          <div className="mx-auto bg-white rounded-xl p-8 shadow-md w-2/3">
            <form onSubmit={handleGo} className="flex flex-col items-center w-full">
              <label className="mb-2 font-semibold">Sendy.in/</label>
              <input
                type="text"
                className="border rounded px-3 py-2 mb-4 w-full"
                placeholder="e.g. games"
                value={domain}
                onChange={e => setDomain(e.target.value)}
              />
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full">Go!</button>
            </form>
          </div>
        </div>
      </header>
    </div>
  );
};

export default GoToUrl;
