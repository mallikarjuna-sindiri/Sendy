import React, {useState} from "react";
import { useNavigate } from "react-router-dom";

export default function Landing(){
  const [domain, setDomain] = useState("");
  const [showHow, setShowHow] = useState(false);
  const navigate = useNavigate();

  function create(){
    const name = domain.trim().toLowerCase();
    if(!/^[a-z0-9\-]{3,30}$/.test(name)){ alert("Enter 3-30 chars: letters, numbers or hyphen."); return; }
    navigate("/setup/" + name);
  }

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
          <h1 className="text-[6rem] font-cursive text-gray-900 leading-tight">Welcome to Sendy!</h1>

          <div className="mt-8 mx-auto bg-white rounded-xl p-8 shadow-md w-2/3">
            <h2 className="text-2xl font-semibold">Enter Domain Name</h2>
            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="text-lg font-medium">Sendy.in/</div>
              <input value={domain} onChange={e=>setDomain(e.target.value)} placeholder="e.g. games" className="px-3 py-2 rounded-md border w-1/2"/>
            </div>
            <div className="mt-6 flex justify-center gap-4">
              <button onClick={create} className="px-4 py-2 bg-green-600 text-white rounded-md">Create!</button>
              <button onClick={()=>setShowHow(true)} className="px-4 py-2 bg-cyan-400 text-white rounded-md">How it works?</button>
            </div>
            {showHow && (
              <div className="mt-4 text-left text-sm text-gray-700">
                <strong>How Sendy works:</strong>
                <ol className="list-decimal ml-6 mt-2">
                  <li>Create a domain and set a password + expiry time.</li>
                  <li>Share the link — visitors must enter the password to access the clipboard.</li>
                  <li>The domain becomes read-only/expired after the timer ends.</li>
                </ol>
                <div className="mt-2 text-xs text-gray-500">Your clipboard data is stored on the server, so you can access it across devices.</div>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}