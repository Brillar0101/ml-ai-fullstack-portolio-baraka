import React, { useState, useRef, useCallback } from 'react';
import { Play, RotateCcw, Loader2 } from 'lucide-react';
import './PythonLab.css';

/**
 * In-browser Python runner using Pyodide (CPython compiled to WebAssembly).
 * The code runs in the visitor's own browser, so labs work online with no
 * backend to host. Pyodide is fetched from a CDN the first time someone hits
 * Run, then cached for the rest of the session.
 *
 * @param {{ code: string, packages?: string[], height?: number }} props
 */
const PYODIDE_VERSION = 'v0.26.2';
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/pyodide.js`;

let pyodidePromise = null;

function loadPyodideOnce(onStatus) {
  if (pyodidePromise) return pyodidePromise;
  pyodidePromise = new Promise((resolve, reject) => {
    onStatus('Loading Python (first run downloads ~6MB, then it is cached)…');
    const existing = document.querySelector(`script[src="${PYODIDE_URL}"]`);
    const start = () => {
      // eslint-disable-next-line no-undef
      window
        .loadPyodide({ indexURL: `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/` })
        .then(resolve)
        .catch(reject);
    };
    if (existing && window.loadPyodide) return start();
    const script = document.createElement('script');
    script.src = PYODIDE_URL;
    script.onload = start;
    script.onerror = () => reject(new Error('Could not load the Python runtime.'));
    document.head.appendChild(script);
  });
  return pyodidePromise;
}

export default function PythonLab({ code, packages = [], height = 260 }) {
  const [source, setSource] = useState(code);
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | running | done | error
  const [note, setNote] = useState('');
  const pyRef = useRef(null);

  const run = useCallback(async () => {
    setOutput('');
    setStatus('loading');
    try {
      if (!pyRef.current) {
        pyRef.current = await loadPyodideOnce(setNote);
      }
      const pyodide = pyRef.current;
      setNote('');

      if (packages.length) {
        setNote(`Installing: ${packages.join(', ')}…`);
        await pyodide.loadPackage(packages);
        setNote('');
      }

      setStatus('running');
      let buffer = '';
      pyodide.setStdout({ batched: (s) => { buffer += s + '\n'; setOutput(buffer); } });
      pyodide.setStderr({ batched: (s) => { buffer += s + '\n'; setOutput(buffer); } });

      await pyodide.runPythonAsync(source);
      setStatus('done');
    } catch (err) {
      setOutput((prev) => `${prev}${prev ? '\n' : ''}${String(err && err.message ? err.message : err)}`);
      setStatus('error');
    }
  }, [source, packages]);

  const reset = useCallback(() => {
    setSource(code);
    setOutput('');
    setStatus('idle');
    setNote('');
  }, [code]);

  const busy = status === 'loading' || status === 'running';

  return (
    <div className="lab">
      <div className="lab-bar">
        <span className="lab-tag">Python · runs in your browser</span>
        <div className="lab-actions">
          <button className="lab-btn lab-run" onClick={run} disabled={busy}>
            {busy ? <Loader2 size={15} className="lab-spin" /> : <Play size={15} />}
            {status === 'loading' ? 'Loading…' : status === 'running' ? 'Running…' : 'Run'}
          </button>
          <button className="lab-btn lab-reset" onClick={reset} disabled={busy} aria-label="Reset code">
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      <textarea
        className="lab-code"
        spellCheck={false}
        value={source}
        onChange={(e) => setSource(e.target.value)}
        style={{ height }}
        aria-label="Editable Python code"
      />

      {note && <div className="lab-note">{note}</div>}

      {(output || status === 'done' || status === 'error') && (
        <pre className={`lab-output ${status === 'error' ? 'lab-output-error' : ''}`}>
          {output || '(no output)'}
        </pre>
      )}
    </div>
  );
}
