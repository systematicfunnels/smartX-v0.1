import { Button } from "@smartx/ui";
import { useState } from "react";

interface UploadBoxProps {
  onFileSelected: (file: File) => void;
  isUploading: boolean;
}

export function UploadBox({ onFileSelected, isUploading }: UploadBoxProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      onFileSelected(selectedFile);
    }
  };

  return (
    <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
      <div className="mb-4">
        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H40M16 8V32M24 8V32M32 8V32M8 32H40" />
        </svg>
      </div>

      <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Meeting File</h3>
      <p className="text-sm text-gray-500 mb-4">Audio/Video files (MP3, WAV, MP4, etc.)</p>

      <label className="cursor-pointer">
        <input
          type="file"
          className="sr-only"
          onChange={handleFileChange}
          accept="audio/*,video/*"
          disabled={isUploading}
        />
        <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Select File
        </div>
      </label>

      {file && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
          Selected: {file.name}
        </div>
      )}
    </div>
  );
}
