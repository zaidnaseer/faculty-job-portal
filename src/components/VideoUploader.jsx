import { useState } from 'react';
import { FaUpload, FaVideo } from 'react-icons/fa';

const VideoUploader = ({ onUpload }) => {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [videoPreview, setVideoPreview] = useState(null);
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };
  
  const handleDragLeave = () => {
    setDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('video/')) {
      processFile(droppedFile);
    }
  };
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };
  
  const processFile = (file) => {
    setFile(file);
    
    // Create a preview URL
    const previewUrl = URL.createObjectURL(file);
    setVideoPreview(previewUrl);
  };
  
  const handleUpload = () => {
    if (!file) return;
    
    setUploading(true);
    
    // In a real app, this would be an API upload
    // For now, we'll simulate with a timeout
    setTimeout(() => {
      // Mock URL that would come from your backend
      const fakeUploadedUrl = URL.createObjectURL(file);
      onUpload(fakeUploadedUrl);
      setUploading(false);
    }, 1500);
  };
  
  return (
    <div className="w-full">
      {!videoPreview ? (
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center
                    ${dragging ? 'border-primary bg-blue-50' : 'border-gray-300'}`}
        >
          <FaUpload className="mx-auto text-3xl text-gray-400 mb-2" />
          <p className="text-gray-600 mb-2">Drag and drop your video here</p>
          <p className="text-gray-500 text-xs mb-4">Or click to select a file</p>
          
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
            id="video-upload"
          />
          <label htmlFor="video-upload" className="btn btn-outline cursor-pointer">
            Select Video
          </label>
        </div>
      ) : (
        <div className="space-y-3">
          <video src={videoPreview} controls className="w-full rounded-lg" />
          <div className="flex justify-between">
            <button 
              onClick={() => {
                setFile(null);
                setVideoPreview(null);
              }}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button 
              onClick={handleUpload}
              disabled={uploading}
              className="btn btn-primary"
            >
              {uploading ? 'Uploading...' : 'Confirm Upload'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUploader;
