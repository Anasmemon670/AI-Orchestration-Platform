import { motion } from 'motion/react';
import { Upload, File, X } from 'lucide-react';
import { useState } from 'react';

export function FileUploader({ accept = '*', maxSize = '100MB', onFileSelect }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      if (onFileSelect) {
        onFileSelect(droppedFile);
      }
    }
  };

  const handleFileInput = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (onFileSelect) {
        onFileSelect(selectedFile);
      }
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <div>
      {!file ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
            isDragging 
              ? 'border-[#00D9FF] bg-[#00D9FF]/10' 
              : 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10'
          }`}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <motion.div
            animate={{ y: isDragging ? -10 : 0 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00D9FF] to-[#9D4EDD] flex items-center justify-center">
              <Upload className="w-8 h-8 text-white" />
            </div>
            
            <div>
              <h3 className="text-white mb-2">
                {isDragging ? 'Drop your file here' : 'Upload your file'}
              </h3>
              <p className="text-white/50 text-sm mb-1">
                Drag and drop or click to browse
              </p>
              <p className="text-white/30 text-xs">
                Max file size: {maxSize}
              </p>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D9FF] to-[#9D4EDD] flex items-center justify-center">
              <File className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex-1">
              <h4 className="text-white mb-1">{file.name}</h4>
              <p className="text-white/50 text-sm">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={removeFile}
              className="w-10 h-10 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center transition-colors group"
            >
              <X className="w-5 h-5 text-white/60 group-hover:text-red-400" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

