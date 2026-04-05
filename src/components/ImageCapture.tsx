import { useRef, useState, useCallback } from 'react';

interface Props {
  onImage: (base64: string, mediaType: string) => void;
}

export default function ImageCapture({ onImage }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const processFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      // Strip the data:image/xxx;base64, prefix
      const [header, base64] = dataUrl.split(',');
      const mediaType = header.replace('data:', '').replace(';base64', '');
      setPreview(dataUrl);
      onImage(base64, mediaType);
    };
    reader.readAsDataURL(file);
  }, [onImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative">
          <img src={preview} alt="Captured" className="w-full max-h-72 object-contain rounded-xl border border-gray-200" />
          <button
            onClick={() => { setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
            className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 shadow hover:bg-white text-gray-600"
            title="Remove image"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="text-4xl mb-3">📸</div>
          <p className="text-gray-500 text-sm mb-4">Take a photo of your textbook, notes, or vocab list</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              📷 Take Photo
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              🖼️ Upload Image
            </button>
          </div>
          {/* Camera capture (mobile) */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
          {/* File picker */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}
    </div>
  );
}
