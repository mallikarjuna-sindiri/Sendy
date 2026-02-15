
import React, {useState, useEffect} from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { readDomains } from "../utils";

export default function Access(){
  const { domain } = useParams();
  const [status, setStatus] = useState("loading");
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  useEffect(()=>{
    const d = readDomains();
    const meta = d[domain];
    if(!meta){ setStatus("missing"); return; }
    if(meta.expiresAt <= Date.now()){ setStatus("expired"); return; }
    if(meta.password){ setStatus("locked"); } else { setStatus("unlocked"); navigate("/" + domain + "/editor"); }
  },[domain, navigate]);

  function check(){
    const d = readDomains(); const meta = d[domain];
    if(!meta){ alert("Domain missing"); return; }
    if(meta.password === input){
      navigate("/" + domain + "/editor");
    } else {
      alert("Incorrect password.");
    }
  }

  if(status==="loading") return <div className="min-h-screen bg-mustard flex items-center justify-center font-cursive text-3xl">Loading...</div>;
  if(status==="missing") return (
    <div className="min-h-screen bg-mustard flex flex-col">
      <nav className="h-12 bg-gray-900 text-white flex items-center justify-end px-6">
        <div className="space-x-6">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/goto" className="hover:underline">Go to URL</Link>
        </div>
      </nav>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
          <h2 className="text-2xl font-cursive mb-2">Domain not found</h2>
          <p className="text-sm text-gray-600 mt-2">The domain <strong>{domain}</strong> doesn't exist.</p>
          <Link to="/" className="mt-4 inline-block px-6 py-2 bg-indigo-600 text-white rounded-md">Go home</Link>
        </div>
      </main>
    </div>
  );
  if(status==="expired") return (
    <div className="min-h-screen bg-mustard flex flex-col">
      <nav className="h-12 bg-gray-900 text-white flex items-center justify-end px-6">
        <div className="space-x-6">
          <Link to="/" className="hover:underline">Home</Link>
        </div>
      </nav>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
          <h2 className="text-2xl font-cursive mb-2">Time limit expired</h2>
          <p className="text-sm text-gray-600 mt-2">The time limit for <strong>{domain}</strong> has expired.</p>
          <Link to="/" className="mt-4 inline-block px-6 py-2 bg-indigo-600 text-white rounded-md">Go home</Link>
        </div>
      </main>
    </div>
  );
    if(status==="loading") return <div className="min-h-screen bg-mustard flex items-center justify-center">Loading...</div>;
    if(status==="missing") return (
      <div className="min-h-screen bg-mustard flex flex-col">
        <nav className="h-12 bg-gray-900 text-white flex items-center justify-end px-6">
          <div className="space-x-6">
            <Link to="/" className="hover:underline">Home</Link>
          </div>
        </nav>
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-xl shadow w-full max-w-md text-center">
            <h2 className="text-2xl font-semibold">Domain not found</h2>
            <p className="text-sm text-gray-600 mt-2">The domain <strong>{domain}</strong> doesn't exist.</p>
            <Link to="/" className="mt-4 inline-block text-indigo-600 underline">Go home</Link>
          </div>
        </main>
      </div>
    );
    if(status==="expired") return (
      <div className="min-h-screen bg-mustard flex flex-col">
        <nav className="h-12 bg-gray-900 text-white flex items-center justify-end px-6">
          <div className="space-x-6">
            <Link to="/" className="hover:underline">Home</Link>
          </div>
        </nav>
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-xl shadow w-full max-w-md text-center">
            <h2 className="text-2xl font-semibold">Time limit expired</h2>
            <p className="text-sm text-gray-600 mt-2">The time limit for <strong>{domain}</strong> has expired.</p>
            <Link to="/" className="mt-4 inline-block text-indigo-600 underline">Go home</Link>
          </div>
        </main>
      </div>
    );

  return (
    <div className="min-h-screen bg-mustard flex flex-col">
      <nav className="h-12 bg-gray-900 text-white flex items-center justify-end px-6">
        <div className="space-x-6">
          <Link to="/" className="hover:underline">Home</Link>
        </div>
      </nav>
      <main className="flex-1 flex items-center justify-center p-12">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
          <h2 className="text-2xl font-cursive mb-2">Protected domain: <span className="font-mono">{domain}</span></h2>
          <p className="text-sm text-gray-600 mt-2">Enter the password to access this clipboard.</p>
          <input value={input} onChange={e=>setInput(e.target.value)} className="mt-4 w-full px-3 py-2 border rounded" placeholder="Password" />
          <div className="mt-4 flex justify-between">
            <button onClick={check} className="px-4 py-2 bg-green-600 text-white rounded">Unlock</button>
            <Link to="/" className="px-4 py-2 border rounded">Back</Link>
          </div>
        </div>
      </main>
    </div>
  );
    return (
      <div className="min-h-screen bg-mustard flex flex-col">
        <nav className="h-12 bg-gray-900 text-white flex items-center justify-end px-6">
          <div className="space-x-6">
            <Link to="/" className="hover:underline">Home</Link>
          </div>
        </nav>
        <main className="flex-1 flex items-center justify-center p-12">
          <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
            <h2 className="text-2xl font-cursive mb-2">Protected domain: <span className="font-mono">{domain}</span></h2>
            <p className="text-sm text-gray-600 mt-2">Enter the password to access this clipboard.</p>
            <input value={input} onChange={e=>setInput(e.target.value)} className="mt-4 w-full px-3 py-2 border rounded" placeholder="Password" />
            <div className="mt-4 flex justify-between">
              <button onClick={check} className="px-4 py-2 bg-green-600 text-white rounded">Unlock</button>
              <Link to="/" className="px-4 py-2 border rounded">Back</Link>
            </div>
          </div>
        </main>
      </div>
    );
}