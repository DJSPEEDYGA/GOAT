/**
 * File Analyzer - Upload & Analyze Documents with AI
 */

import React, { useState, useRef } from 'react';
import {
  Upload, FileText, Image, Database, Loader, Sparkles, Copy,
  Check, Download, Trash2, File, FileSpreadsheet, FileCode,
  X, Eye, BarChart3, Zap, Brain
} from 'lucide-react';

const FILE_TYPES = {
  'application/pdf': { icon: <FileText className="w-5 h-5" />, color: 'text-red-400', label: 'PDF' },
  'text/csv': { icon: <FileSpreadsheet className="w-5 h-5" />, color: 'text-green-400', label: 'CSV' },
  'application/json': { icon: <FileCode className="w-5 h-5" />, color: 'text-yellow-400', label: 'JSON' },
  'text/plain': { icon: <FileText className="w-5 h-5" />, color: 'text-blue-400', label: 'TXT' },
  'image/png': { icon: <Image className="w-5 h-5" />, color: 'text-purple-400', label: 'PNG' },
  'image/jpeg': { icon: <Image className="w-5 h-5" />, color: 'text-purple-400', label: 'JPG' },
};

export default function FileAnalyzer() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = (newFiles) => {
    const fileList = Array.from(newFiles).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    setFiles([...files, ...fileList]);
    if (fileList.length > 0) setSelectedFile(fileList[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const analyzeFile = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setAnalysis('');

    try {
      const response = await fetch('/api/file-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
          query: query || 'Analyze this file and provide key insights'
        })
      });
      const data = await response.json();
      setAnalysis(data.analysis || 'Analysis complete.');
    } catch (error) {
      setAnalysis(`Error analyzing file: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const fileInfo = (type) => FILE_TYPES[type] || { icon: <File className="w-5 h-5" />, color: 'text-gray-400', label: 'File' };

  return (
    <div className="flex h-full bg-gray-950">
      {/* Left Panel */}
      <div className="w-80 bg-gray-900/50 border-r border-gray-800 flex flex-col">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-green-500 rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">File Analyzer</h2>
              <p className="text-xs text-gray-500">Upload & analyze with AI</p>
            </div>
          </div>

          {/* Drop Zone */}
          <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all mb-4 ${
                  dragOver ? 'border-teal-500 bg-teal-500/10' : 'border-gray-700 hover:border-gray-600'
                }`}
               onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
               onDragLeave={() => setDragOver(false)}
               onDrop={handleDrop}
               onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Drop files here or click to upload</p>
            <p className="text-[10px] text-gray-600 mt-1">PDF, CSV, JSON, TXT, Images</p>
            <input ref={fileInputRef} type="file" multiple onChange={(e) => handleFiles(e.target.files)} className="hidden" />
          </div>

          {/* File List */}
          <div className="space-y-1.5">
            {files.map(file => {
              const info = fileInfo(file.type);
              return (
                <div key={file.id}
                     onClick={() => setSelectedFile(file)}
                     className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all ${
                       selectedFile?.id === file.id ? 'bg-teal-500/20 border border-teal-500/50' : 'bg-gray-800/30 hover:bg-gray-800/60 border border-transparent'
                     }`}>
                  <span className={info.color}>{info.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white truncate">{file.name}</p>
                    <p className="text-[10px] text-gray-500">{formatSize(file.size)}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setFiles(files.filter(f => f.id !== file.id)); if (selectedFile?.id === file.id) setSelectedFile(null); }}
                          className="text-gray-600 hover:text-red-400 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedFile ? (
          <>
            <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={fileInfo(selectedFile.type).color}>{fileInfo(selectedFile.type).icon}</span>
                <span className="text-sm font-medium text-white">{selectedFile.name}</span>
                <span className="text-xs text-gray-500">{formatSize(selectedFile.size)}</span>
              </div>
            </div>

            {/* Query & Analyze */}
            <div className="px-4 py-3 border-b border-gray-800 flex gap-2">
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                     placeholder="Ask about this file..."
                     className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50" />
              <button onClick={analyzeFile} disabled={loading}
                      className="px-4 py-2 bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-400 hover:to-green-400 disabled:opacity-50 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all">
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                Analyze
              </button>
            </div>

            {/* Analysis Output */}
            <div className="flex-1 overflow-y-auto p-6">
              {analysis ? (
                <div className="max-w-3xl mx-auto whitespace-pre-wrap text-gray-200 leading-relaxed text-sm">{analysis}</div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Eye className="w-12 h-12 text-gray-700 mb-3" />
                  <p className="text-gray-500 text-sm">Click "Analyze" to get AI insights about this file</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-teal-500/10 rounded-2xl flex items-center justify-center mb-4 border border-teal-500/20">
              <Upload className="w-10 h-10 text-teal-500/50" />
            </div>
            <h3 className="text-lg font-bold text-gray-400 mb-2">Upload Files to Analyze</h3>
            <p className="text-sm text-gray-600 max-w-sm">
              Drag and drop files or click to upload. Supports PDF, CSV, JSON, TXT, and images.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}