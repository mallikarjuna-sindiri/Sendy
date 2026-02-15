import React, {useState, useEffect} from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { DURATIONS, createDomain } from "../utils";

export default function Setup(){
  const { domain } = useParams();
  const [password, setPassword] = useState("");
  const [duration, setDuration] = useState("1hr");
  const [notice, setNotice] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(()=>{
    document.title = "Setup " + domain;
  },[domain]);

  async function create(){
    if(password.length < 1){ if(!confirm("No password set — domain will be public. Continue?")) return; }
    setNotice("");
    setIsCreating(true);
    try {
      await createDomain({
        domain,
        password: password || null,
        durationMs: DURATIONS[duration] || DURATIONS["1hr"],
      });
      navigate("/" + domain);
    } catch (error) {
      if (error.status === 409) {
        setNotice("That domain already exists and is still active. Try a new name or wait for expiry.");
        return;
      }
      alert(error.message || "Failed to create domain.");
    } finally {
      setIsCreating(false);
    }
  }

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

      <header className="flex-1 flex items-start justify-center6 p-12">
        <div className="w-full max-w-3xl text-center">
          <h1 className="text-[4rem] font-cursive text-gray-900 leading-tight mb-8">Setup your Sendy Domain</h1>
          <div className="mx-auto bg-white rounded-xl p-8 shadow-md w-2/3">
            <h2 className="text-2xl font-semibold mb-4">Setup domain: <span className="font-mono">{domain}</span></h2>
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-4">
                <label className="w-28 text-right text-sm font-medium">Password:</label>
                <input value={password} onChange={e=>setPassword(e.target.value)} className="flex-1 px-3 py-2 border rounded-md" placeholder="(optional)"/>
              </div>
              <div className="flex items-center gap-4">
                <label className="w-28 text-right text-sm font-medium">Expiry:</label>
                <select value={duration} onChange={e=>setDuration(e.target.value)} className="flex-1 px-3 py-2 border rounded-md">
                  <option value="1hr">1 hour</option>
                  <option value="1day">1 day</option>
                  <option value="1week">1 week</option>
                </select>
              </div>
            </div>

            {notice && <div className="mt-3 text-sm text-yellow-800 bg-yellow-100 p-2 rounded">{notice}</div>}

            <div className="mt-6 flex justify-center gap-4">
              <button onClick={create} className="px-4 py-2 bg-green-600 text-white rounded-md" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create domain"}
              </button>
              <Link to="/" className="px-4 py-2 border rounded-md">Cancel</Link>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}