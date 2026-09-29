import React, { useState } from 'react';
import { FileItem } from '../../types/assistant';
import {
  Folder,
  FileText,
  Image,
  Video,
  Music,
  Download,
  Trash2,
  Share2,
  Edit2,
  Search,
  Eye,
  CheckCircle,
  AlertTriangle,
  FileCode,
  Volume2,
} from 'lucide-react';
import { voiceService } from '../../services/voiceService';

interface FileManagerViewProps {
  files: FileItem[];
  onDeleteFile: (id: string) => void;
  onRenameFile: (id: string, newName: string) => void;
}

export const FileManagerView: React.FC<FileManagerViewProps> = ({
  files,
  onDeleteFile,
  onRenameFile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
  const [renameTarget, setRenameTarget] = useState<FileItem | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const fileTypes = ['ALL', 'video', 'image', 'audio', 'document', 'download'];

  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || f.type === filterType;
    return matchesSearch && matchesType;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-5 h-5 text-emerald-400" />;
      case 'video':
        return <Video className="w-5 h-5 text-red-400" />;
      case 'audio':
        return <Music className="w-5 h-5 text-purple-400" />;
      case 'download':
        return <Download className="w-5 h-5 text-cyan-400" />;
      default:
        return <FileText className="w-5 h-5 text-blue-400" />;
    }
  };

  const handleAnnounceDownload = (fileName: string) => {
    voiceService.speak(`आपका download complete हो गया है: ${fileName}`, 'MAYRA');
  };

  const handleConfirmDelete = () => {
    if (fileToDelete) {
      onDeleteFile(fileToDelete.id);
      setFileToDelete(null);
    }
  };

  const handleConfirmRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (renameTarget && renameValue.trim()) {
      onRenameFile(renameTarget.id, renameValue.trim());
      setRenameTarget(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl border border-cyan-500/20 bg-gray-900/60 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
            <Folder className="w-5 h-5 text-cyan-400" />
            ANDROID INTEGRATED FILE MANAGER
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Scoped storage awareness • Download detector • Safe confirmation workflows
          </p>
        </div>

        <button
          onClick={() => handleAnnounceDownload('YouTube_Video_Final_1080p.mp4')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs hover:bg-cyan-500/30 transition"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Test Download Announcement</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents, videos, downloads..."
            className="w-full bg-gray-950 border border-cyan-900 text-xs text-white pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {fileTypes.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-2 rounded-xl text-xs font-mono uppercase whitespace-nowrap border transition ${
                filterType === t
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                  : 'text-slate-400 border-gray-800 bg-gray-950/60 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {filteredFiles.map((file) => (
          <div
            key={file.id}
            className="p-4 rounded-xl border border-cyan-900/40 bg-gray-950/70 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-3 group"
          >
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-gray-900 border border-gray-800">
                {getFileIcon(file.type)}
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-slate-400">
                {file.size}
              </span>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition">
                {file.name}
              </h4>
              <div className="text-[10px] font-mono text-slate-500 mt-1 flex justify-between">
                <span>{file.path}</span>
                <span>{file.date}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-900 flex items-center justify-end gap-1.5">
              <button
                onClick={() => setPreviewFile(file)}
                className="p-1.5 rounded text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40 transition"
                title="Preview"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setRenameTarget(file);
                  setRenameValue(file.name);
                }}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-gray-800 transition"
                title="Rename"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setFileToDelete(file)}
                className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition"
                title="Delete with confirmation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 rounded-2xl border border-rose-500/40 bg-gray-950 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
              <h3 className="text-sm font-bold font-mono">CONFIRM DELETION</h3>
            </div>
            <p className="text-xs text-slate-300">
              क्या आप वाकई <strong className="text-white">&quot;{fileToDelete.name}&quot;</strong> को हटाना चाहते हैं? यह क्रिया वापस नहीं ली जा सकती।
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setFileToDelete(null)}
                className="px-3 py-1.5 rounded-lg border border-gray-800 text-xs font-mono text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-mono font-bold hover:bg-rose-400"
              >
                Delete File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleConfirmRename}
            className="w-full max-w-sm p-6 rounded-2xl border border-cyan-500/40 bg-gray-950 space-y-4 shadow-2xl"
          >
            <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-cyan-400" />
              RENAME FILE
            </h3>
            <input
              type="text"
              required
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full bg-gray-900 border border-cyan-900 text-xs text-white px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-400 font-mono"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRenameTarget(null)}
                className="px-3 py-1.5 rounded-lg border border-gray-800 text-xs font-mono text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-cyan-500 text-gray-950 text-xs font-mono font-bold hover:bg-cyan-400"
              >
                Save Name
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl border border-cyan-500/40 bg-gray-950 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-cyan-950 pb-2">
              <h3 className="text-xs font-bold font-mono text-white truncate max-w-xs">
                {previewFile.name}
              </h3>
              <button
                onClick={() => setPreviewFile(null)}
                className="text-xs font-mono text-slate-400 hover:text-white"
              >
                ✕ Close
              </button>
            </div>
            <div className="h-48 rounded-xl bg-gray-900/60 border border-cyan-950 flex flex-col items-center justify-center text-center p-4 space-y-2">
              {getFileIcon(previewFile.type)}
              <div className="text-xs font-mono text-slate-300">File Type: {previewFile.type}</div>
              <div className="text-[11px] font-mono text-slate-500">Size: {previewFile.size} • Path: {previewFile.path}</div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setPreviewFile(null)}
                className="px-4 py-2 rounded-lg bg-cyan-500 text-gray-950 text-xs font-mono font-bold hover:bg-cyan-400"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
