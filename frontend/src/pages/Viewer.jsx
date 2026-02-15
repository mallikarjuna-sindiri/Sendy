import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  formatDate,
  formatFileSize,
  base64ToBlob,
  getDomain,
  unlockDomain,
  normalizeDomain,
  getAccessToken,
  setAccessToken,
} from "../utils";

export default function Viewer() {
  const { domain } = useParams();
  const navigate = useNavigate();
  const [meta, setMeta] = useState(null);
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [locked, setLocked] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const token = getAccessToken(domain);
    async function loadDomain(accessToken) {
      try {
        const data = await getDomain(domain, accessToken);
        const normalized = normalizeDomain(data);
        setMeta(normalized);
        setLocked(normalized.isLocked);
        setUnlocked(!normalized.isLocked || Boolean(accessToken));
      } catch (error) {
        if (error.status === 401) {
          setLocked(true);
          setUnlocked(false);
          return;
        }
        if (error.status === 404) {
          alert("Domain not found");
          navigate("/");
          return;
        }
        if (error.status === 410) {
          navigate("/expired");
          return;
        }
        alert(error.message || "Failed to load domain.");
      }
    }

    loadDomain(token);
  }, [domain, navigate]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  async function unlock() {
    try {
      const data = await unlockDomain(domain, password);
      setAccessToken(domain, data.token, data.expires_at);
      setUnlocked(true);
      const refreshed = await getDomain(domain, data.token);
      setMeta(normalizeDomain(refreshed));
    } catch (error) {
      alert(error.message || "Incorrect password");
    }
  }

  function remaining() {
    if (!meta) return 0;
    const r = Math.max(0, meta.expiresAt - now);
    const s = Math.floor(r / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${m}m ${sec}s`;
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
  }

  function downloadFile(file) {
    if (file.url) {
      const a = document.createElement('a');
      a.href = file.url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }
    if (!file.data) return;
    const blob = base64ToBlob(file.data, file.type);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function editMode() {
    if (!meta?.isLocked) {
      navigate("/editor/" + domain);
      return;
    }
    const existingToken = getAccessToken(domain);
    if (existingToken) {
      navigate("/editor/" + domain);
      return;
    }
    const pass = prompt("Enter password to edit:");
    if (!pass) return;
    try {
      const data = await unlockDomain(domain, pass);
      setAccessToken(domain, data.token, data.expires_at);
      navigate("/editor/" + domain);
    } catch (error) {
      alert(error.message || "Incorrect password");
    }
  }

  if (!meta && !locked) return null;

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-mustard flex flex-col">
        <nav className="h-12 bg-gray-900 text-white flex items-center justify-end px-6">
          <div className="space-x-6">
            <Link to="/" className="hover:underline">Home</Link>
          </div>
        </nav>
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
            <h2 className="text-2xl font-semibold">🔒 Password Required</h2>
            <p className="mt-2 text-gray-600">Domain: <span className="font-mono">{domain}</span></p>
            <div className="mt-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && unlock()}
                placeholder="Enter password"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="mt-6 flex justify-between">
              <button onClick={unlock} className="px-4 py-2 bg-indigo-600 text-white rounded">Unlock</button>
              <Link to="/" className="px-4 py-2 border rounded">Home</Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mustard flex flex-col">
      <nav className="h-12 bg-gray-900 text-white flex items-center justify-end px-6">
        <div className="space-x-6">
          <button onClick={editMode} className="hover:underline">Edit Mode</button>
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/goto" className="hover:underline">Go to URL</Link>
          <a className="hover:underline" href="#">About Us</a>
          <a className="hover:underline" href="#">Terms &amp; Conditions</a>
        </div>
      </nav>
      <header className="flex-1 flex items-start justify-center p-12">
        <div className="w-full max-w-5xl text-center">
          <h1 className="text-[4rem] font-cursive text-gray-900 leading-tight mb-8">{domain}.sendy</h1>
          <div className="text-sm text-gray-700 mb-6">Expires at: {formatDate(meta.expiresAt)} • Remaining: <span className="font-mono">{remaining()}</span></div>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl shadow border">
              <h3 className="font-semibold mb-3">Clipboard Content</h3>
              <div
                className="min-h-[200px] p-4 bg-gray-50 rounded"
                style={{
                  fontSize: (meta.meta?.fontSize || 18) + "px",
                  color: meta.meta?.color || "#111827",
                  fontWeight: meta.meta?.bold ? 700 : 400
                }}
                dangerouslySetInnerHTML={{ __html: meta.content || "<p>Empty clipboard</p>" }}
              />
            </div>

            {meta.files && meta.files.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow border">
                <h3 className="font-semibold mb-3">Files ({meta.files.length})</h3>
                <div className="space-y-2">
                  {meta.files.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{file.name}</div>
                        <div className="text-xs text-gray-500">
                          {formatFileSize(file.size)} • Uploaded {new Date(file.uploadedAt).toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={() => downloadFile(file)}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 ml-3"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
