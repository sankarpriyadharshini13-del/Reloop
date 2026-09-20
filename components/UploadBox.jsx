'use client';

import { useRef, useState } from 'react';
import { Camera, ImagePlus, Upload, X } from 'lucide-react';

/**
 * Drag & drop, click-to-browse and camera capture in one control.
 * The parent owns the file; this component only reports picks and clears.
 */
export default function UploadBox({ preview, loading = false, onFile, onClear }) {
  const fileRef = useRef(null);
  const cameraRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleInput = (event) => {
    const file = event.target.files?.[0];
    if (file) onFile(file);
    event.target.value = ''; // allow picking the same file again
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    if (loading) return;
    const file = event.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleInput} />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleInput}
      />

      {preview ? (
        <div className="glass relative overflow-hidden p-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-ink-deep">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview of the photo you selected" className="h-full w-full object-contain" />

            {loading && (
              <div className="absolute inset-0 bg-ink/50" aria-hidden="true">
                <div className="absolute inset-x-0 h-0.5 animate-scan bg-green-400 shadow-[0_0_24px_6px_rgba(34,197,94,0.7)]" />
                <span className="absolute left-3 top-3 h-6 w-6 rounded-tl-lg border-l-2 border-t-2 border-green-400" />
                <span className="absolute right-3 top-3 h-6 w-6 rounded-tr-lg border-r-2 border-t-2 border-green-400" />
                <span className="absolute bottom-3 left-3 h-6 w-6 rounded-bl-lg border-b-2 border-l-2 border-green-400" />
                <span className="absolute bottom-3 right-3 h-6 w-6 rounded-br-lg border-b-2 border-r-2 border-green-400" />
              </div>
            )}
          </div>

          {!loading && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Remove photo"
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-ink/80 text-white shadow-lg backdrop-blur transition hover:bg-ink"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`glass cursor-pointer border-2 border-dashed p-6 text-center transition duration-200 sm:p-10 ${
            dragging ? 'scale-[1.01] border-green-400 bg-green-500/10' : 'border-white/20 hover:border-green-400/60'
          }`}
        >
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-green-500/15 text-green-400">
            {dragging ? <ImagePlus className="h-8 w-8" /> : <Upload className="h-8 w-8" />}
          </div>
          <h2 className="mt-5 text-xl font-semibold text-white">
            {dragging ? 'Drop it here' : 'Drop a photo of your old device'}
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-sm text-slate-400">
            Or click anywhere in this box to browse. JPG, PNG or WebP.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              className="btn-primary !py-3"
              onClick={(e) => {
                e.stopPropagation();
                fileRef.current?.click();
              }}
            >
              <ImagePlus className="h-5 w-5" aria-hidden="true" />
              Choose photo
            </button>
            <button
              type="button"
              className="btn-ghost !py-3"
              onClick={(e) => {
                e.stopPropagation();
                cameraRef.current?.click();
              }}
            >
              <Camera className="h-5 w-5" aria-hidden="true" />
              Use camera
            </button>
          </div>

          <p className="mt-6 text-xs text-slate-500">
            For best results: one item, good light, and the device filling most of the frame.
          </p>
        </div>
      )}
    </div>
  );
}
