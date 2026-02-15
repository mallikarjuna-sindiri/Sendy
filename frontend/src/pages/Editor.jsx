import React, {useEffect, useRef, useState} from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  formatDate,
  formatFileSize,
  fileToBase64,
  base64ToBlob,
  getDomain,
  updateDomain,
  unlockDomain,
  normalizeDomain,
  getAccessToken,
  setAccessToken,
} from "../utils";

export default function Editor(){
  const { domain } = useParams();
  const navigate = useNavigate();
  const [meta, setMeta] = useState(null);
  const editorRef = useRef();
  const fileInputRef = useRef();
  const [fontSize, setFontSize] = useState(18);
  const [color, setColor] = useState("#111827");
  const [bold, setBold] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [token, setToken] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(()=>{
    async function loadDomain(accessToken) {
      try {
        const data = await getDomain(domain, accessToken);
        const normalized = normalizeDomain(data);
        setMeta(normalized);
        setFontSize(normalized.meta?.fontSize || 18);
        setColor(normalized.meta?.color || "#111827");
        setBold(normalized.meta?.bold || false);
        setFiles(normalized.files || []);
        if (editorRef.current) {
          editorRef.current.innerHTML = normalized.content || "";
        }
      } catch (error) {
        if (error.status === 401) {
          const pass = prompt("Enter password to edit:");
          if (!pass) {
            navigate("/" + domain);
            return;
          }
          try {
            const unlocked = await unlockDomain(domain, pass);
            setAccessToken(domain, unlocked.token, unlocked.expires_at);
            setToken(unlocked.token);
            await loadDomain(unlocked.token);
          } catch (unlockError) {
            alert(unlockError.message || "Incorrect password");
            navigate("/" + domain);
          }
          return;
        }
        if (error.status === 404) {
          alert("Domain missing");
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

    const existingToken = getAccessToken(domain);
    setToken(existingToken);
    loadDomain(existingToken);
  },[domain, navigate]);

  useEffect(()=>{
    const t = setInterval(()=> setNow(Date.now()), 1000);
    return ()=> clearInterval(t);
  },[]);

  useEffect(()=>{
    if(editorRef.current){
      editorRef.current.style.fontSize = fontSize + "px";
      editorRef.current.style.color = color;
      editorRef.current.style.fontWeight = bold ? "700" : "400";
    }
  },[fontSize,color,bold]);

  async function save(){
    if (!meta) return;
    setIsSaving(true);
    try {
      const payload = {
        content: editorRef.current.innerHTML,
        meta: { font_size: fontSize, color, bold },
        files: files.map((file) => ({
          id: file.id,
          name: file.name,
          size: file.size,
          type: file.type,
          url: file.url || null,
          uploaded_at: new Date(file.uploadedAt).toISOString(),
        })),
      };
      const updated = await updateDomain(domain, payload, token);
      const normalized = normalizeDomain(updated);
      setMeta(normalized);
      setFiles(normalized.files || []);
      alert("Saved!");
    } catch (error) {
      alert(error.message || "Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleFileUpload(e) {
    const selectedFiles = Array.from(e.target.files);
    
    if (files.length + selectedFiles.length > 5) {
      alert("Maximum 5 files allowed!");
      return;
    }

    setUploading(true);
    try {
      const newFiles = [];
      for (const file of selectedFiles) {
        const base64 = await fileToBase64(file);
        newFiles.push({
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: base64,
          uploadedAt: Date.now()
        });
      }
      setFiles(prev => [...prev, ...newFiles]);
      alert(`${selectedFiles.length} file(s) uploaded! Click Save to persist.`);
    } catch (error) {
      alert("Error uploading files: " + error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function deleteFile(fileId) {
    if (!confirm("Delete this file?")) return;
    setFiles(prev => prev.filter(f => f.id !== fileId));
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

  function remaining(){
    if(!meta) return 0;
    const r = Math.max(0, meta.expiresAt - now);
    const s = Math.floor(r/1000);
    const h = Math.floor(s/3600); const m = Math.floor((s%3600)/60); const sec = s%60;
    if(h>0) return `${h}h ${m}m ${sec}s`;
    if(m>0) return `${m}m ${sec}s`;
    return `${sec}s`;
  }

  function copyLink(){
    navigator.clipboard?.writeText(window.location.origin + "/" + domain);
    alert("Copied link");
  }

  if(!meta) return null;
  if(meta.expiresAt <= Date.now()){ navigate("/expired"); return null; }

  return (
    <div className="min-h-screen bg-mustard flex flex-col">
      <nav className="h-12 bg-gray-900 text-white flex items-center justify-end px-6">
        <div className="space-x-6">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/goto" className="hover:underline">Go to URL</Link>
        </div>
      </nav>
      <main className="flex-1 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-cursive text-gray-900">{domain}.sendy</h1>
              <div className="text-sm text-gray-700">Expires at: {formatDate(meta.expiresAt)} • Remaining: <span className="font-mono">{remaining()}</span></div>
            </div>
            <div className="flex gap-2">
              <button onClick={copyLink} className="px-3 py-2 bg-green-600 text-white rounded">Copy link</button>
              <Link to="/" className="px-3 py-2 border rounded">Home</Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <aside className="md:col-span-1 bg-white/80 p-4 rounded-xl shadow-md">
              <h3 className="font-semibold font-cursive text-lg">Controls</h3>
              <div className="mt-3">
                <label className="text-sm">Font size</label>
                <input type="range" min="12" max="40" value={fontSize} onChange={e=>setFontSize(Number(e.target.value))} className="w-full"/>
                <div className="text-sm mt-1">{fontSize}px</div>
              </div>
              <div className="mt-3">
                <label className="text-sm">Color</label>
                <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="w-full h-10 p-1"/>
              </div>
              <div className="mt-3">
                <label className="inline-flex items-center"><input type="checkbox" checked={bold} onChange={e=>setBold(e.target.checked)} className="mr-2"/>Bold</label>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={save} className="px-3 py-2 bg-indigo-600 text-white rounded" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button onClick={async ()=>{
                  const existingToken = getAccessToken(domain);
                  setToken(existingToken);
                  try {
                    const refreshed = await getDomain(domain, existingToken);
                    const normalized = normalizeDomain(refreshed);
                    if (editorRef.current) {
                      editorRef.current.innerHTML = normalized.content || "";
                    }
                    setFontSize(normalized.meta?.fontSize || 18);
                    setColor(normalized.meta?.color || "#111827");
                    setBold(normalized.meta?.bold || false);
                    setFiles(normalized.files || []);
                    setMeta(normalized);
                  } catch (error) {
                    alert(error.message || "Failed to refresh domain.");
                  }
                }} className="px-3 py-2 border rounded">Revert</button>
              </div>
            </aside>

            <main className="md:col-span-3 space-y-4">
              <div className="bg-white p-4 rounded-xl border shadow">
                <div className="mb-2 text-sm text-gray-600 font-cursive">Editable clipboard (rich text). Changes local until you Save.</div>
                <div ref={editorRef} contentEditable className="min-h-[320px] p-4 border rounded focus:outline-none" style={{fontSize: fontSize + "px", color: color, fontWeight: bold?700:400}}></div>
                <div className="mt-3 text-sm text-gray-500">Tip: paste text, style it, then click Save.</div>
              </div>

              <div className="bg-white p-4 rounded-xl border shadow">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold font-cursive">Files ({files.length}/5)</h3>
                  <div>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      multiple 
                      onChange={handleFileUpload}
                      disabled={files.length >= 5 || uploading}
                      className="hidden"
                      id="file-upload"
                    />
                    <label 
                      htmlFor="file-upload" 
                      className={`px-3 py-2 rounded cursor-pointer ${files.length >= 5 || uploading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                    >
                      {uploading ? 'Uploading...' : '+ Upload Files'}
                    </label>
                  </div>
                </div>
                
                {files.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 font-cursive">
                    No files uploaded yet. Max 5 files allowed.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {files.map(file => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{file.name}</div>
                          <div className="text-xs text-gray-500">
                            {formatFileSize(file.size)} • Uploaded {new Date(file.uploadedAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-3">
                          <button 
                            onClick={() => downloadFile(file)}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                          >
                            Download
                          </button>
                          <button 
                            onClick={() => deleteFile(file.id)}
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-3 text-xs text-gray-500">
                  Note: Files are currently stored as data URLs in the database; large files can cause issues.
                </div>
              </div>
            </main>
          </div>
        </div>
      </main>
    </div>
  );
}