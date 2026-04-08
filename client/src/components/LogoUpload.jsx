// client/src/components/LogoUpload.jsx
import { useRef, useState } from 'react';

export default function LogoUpload({ file, onChange }) {
  const inputRef = useRef();
  const [isDragOver, setIsDragOver] = useState(false);

  function handleFile(f) {
    if (f && ['image/png', 'image/jpeg', 'image/svg+xml'].includes(f.type)) {
      onChange(f);
    }
  }

  return (
    <div>
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
        Logo <span className="text-red-400">*</span>
      </label>
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragOver ? 'border-electric bg-electric/10' : 'border-border hover:border-gray-500'
        }`}
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFile(e.dataTransfer.files[0]); }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.svg"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        {file ? (
          <p className="text-sm text-green-400 truncate">{file.name}</p>
        ) : (
          <p className="text-sm text-gray-500">Drop logo here or click<br /><span className="text-xs">PNG, JPG, SVG</span></p>
        )}
      </div>
    </div>
  );
}
