// client/src/components/RefUpload.jsx
import { useRef, useState } from 'react';

export default function RefUpload({ file, onChange }) {
  const inputRef = useRef();
  const [isDragOver, setIsDragOver] = useState(false);

  function handleFile(f) {
    if (f) onChange(f);
  }

  return (
    <div>
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
        Reference Image <span className="text-gray-600">(optional)</span>
      </label>
      <div
        className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${
          isDragOver ? 'border-cyan bg-cyan/10' : 'border-border hover:border-gray-500'
        }`}
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFile(e.dataTransfer.files[0]); }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        {file ? (
          <p className="text-sm text-cyan truncate">{file.name}</p>
        ) : (
          <p className="text-xs text-gray-600">Drop reference image</p>
        )}
      </div>
    </div>
  );
}
