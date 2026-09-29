import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  fetchDriveFiles,
  fetchDriveStorageQuota,
  createDriveFolder,
  uploadDriveFile,
  deleteDriveFile,
  starDriveFile,
  DriveStorageQuota,
} from '../../services/googleDriveService';
import { DriveFileItem } from '../../types/assistant';
import {
  HardDrive,
  Search,
  Upload,
  FolderPlus,
  RefreshCw,
  Folder,
  FileText,
  FileSpreadsheet,
  Presentation,
  Image,
  Video,
  File,
  Star,
  ExternalLink,
  Trash2,
  LogOut,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Plus,
  X,
  Sparkles,
} from 'lucide-react';

interface GoogleDriveViewProps {
  onSpeak?: (text: string) => void;
  onLogTerminal?: (role: 'USER' | 'MAYRA' | 'SYSTEM', msg: string, status?: any) => void;
}

export const GoogleDriveView: React.FC<GoogleDriveViewProps> = ({ onSpeak, onLogTerminal }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Drive Data
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [storageQuota, setStorageQuota] = useState<DriveStorageQuota | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'folder' | 'document' | 'spreadsheet' | 'presentation' | 'media' | 'starred'>('all');
  const [folderHistory, setFolderHistory] = useState<Array<{ id: string; name: string }>>([
    { id: 'root', name: 'My Drive' },
  ]);

  // Modals
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const currentFolderId = folderHistory[folderHistory.length - 1].id;

  // Initialize Auth State Listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        setNeedsAuth(false);
        loadDriveData(accessToken, currentFolderId, activeFilter, searchQuery);
      },
      () => {
        setUser(null);
        setToken(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  // Reload files when folder or filter changes if token is present
  useEffect(() => {
    if (token) {
      loadDriveData(token, currentFolderId, activeFilter, searchQuery);
    }
  }, [currentFolderId, activeFilter]);

  const loadDriveData = async (
    accessToken: string,
    folderId?: string,
    filter?: string,
    query?: string
  ) => {
    setLoading(true);
    try {
      const quota = await fetchDriveStorageQuota(accessToken);
      if (quota) setStorageQuota(quota);

      const targetFolderId = folderId === 'root' ? undefined : folderId;
      const res = await fetchDriveFiles(accessToken, {
        folderId: targetFolderId,
        mimeTypeFilter: filter === 'all' || filter === 'starred' ? undefined : filter,
        starredOnly: filter === 'starred',
        searchQuery: query || undefined,
      });

      setFiles(res.files);
    } catch (err: any) {
      console.error('Error loading Google Drive data:', err);
      if (err.message?.includes('401') || err.message?.includes('unauthenticated')) {
        setNeedsAuth(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setNeedsAuth(false);
        onLogTerminal?.('SYSTEM', `Google Drive connected for ${result.user.email}`, 'COMPLETED');
        onSpeak?.('Google Drive सफलतापूर्वक कनेक्ट हो गया है। आपके सभी फाइल्स सुरक्षित लोड हो रहे हैं।');
        loadDriveData(result.accessToken, currentFolderId, activeFilter, searchQuery);
      }
    } catch (err: any) {
      console.error('Sign in failed:', err);
      onLogTerminal?.('SYSTEM', `Google Sign-in failed: ${err.message || err}`, 'FAILED');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setNeedsAuth(true);
    setFiles([]);
    setStorageQuota(null);
    onLogTerminal?.('SYSTEM', 'Google Drive disconnected by user.', 'COMPLETED');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token) {
      loadDriveData(token, currentFolderId, activeFilter, searchQuery);
    }
  };

  const handleFolderClick = (folder: DriveFileItem) => {
    setFolderHistory((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  const handleNavigateBreadcrumb = (index: number) => {
    setFolderHistory((prev) => prev.slice(0, index + 1));
  };

  const handleStarToggle = async (file: DriveFileItem) => {
    if (!token) return;
    const newStatus = !file.starred;
    // Optimistic update
    setFiles((prev) =>
      prev.map((f) => (f.id === file.id ? { ...f, starred: newStatus } : f))
    );
    try {
      await starDriveFile(token, file.id, newStatus);
    } catch {
      // Revert on error
      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, starred: !newStatus } : f))
      );
    }
  };

  // Explicit Confirm Deletion
  const handleExecuteDelete = async () => {
    if (!token || !deleteConfirmItem) return;
    setIsDeleting(true);
    try {
      await deleteDriveFile(token, deleteConfirmItem.id);
      setFiles((prev) => prev.filter((f) => f.id !== deleteConfirmItem.id));
      onLogTerminal?.('SYSTEM', `Deleted Drive item: ${deleteConfirmItem.name}`, 'COMPLETED');
      setDeleteConfirmItem(null);
    } catch (err: any) {
      console.error('Failed to delete file:', err);
      alert('Delete failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Create New Folder
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newFolderName.trim()) return;
    setIsCreatingFolder(true);
    try {
      const parentId = currentFolderId === 'root' ? undefined : currentFolderId;
      const created = await createDriveFolder(token, newFolderName.trim(), parentId);
      setFiles((prev) => [created, ...prev]);
      onLogTerminal?.('SYSTEM', `Created Drive folder: ${created.name}`, 'COMPLETED');
      setNewFolderName('');
      setShowFolderModal(false);
    } catch (err: any) {
      console.error('Folder creation failed:', err);
      alert('Folder creation failed: ' + err.message);
    } finally {
      setIsCreatingFolder(false);
    }
  };

  // Upload File
  const handleFileUploadConfirm = async () => {
    if (!token || !selectedUploadFile) return;
    setIsUploading(true);
    try {
      const parentId = currentFolderId === 'root' ? undefined : currentFolderId;
      const uploaded = await uploadDriveFile(token, selectedUploadFile, parentId);
      setFiles((prev) => [uploaded, ...prev]);
      onLogTerminal?.('SYSTEM', `Uploaded file to Drive: ${uploaded.name}`, 'COMPLETED');
      setSelectedUploadFile(null);
    } catch (err: any) {
      console.error('Upload failed:', err);
      alert('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Helpers
  const formatBytes = (bytesStr?: string | number) => {
    if (!bytesStr) return '0 B';
    const bytes = typeof bytesStr === 'string' ? parseInt(bytesStr, 10) : bytesStr;
    if (isNaN(bytes) || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/vnd.google-apps.folder') {
      return <Folder className="w-5 h-5 text-amber-400" />;
    }
    if (mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('pdf')) {
      return <FileText className="w-5 h-5 text-blue-400" />;
    }
    if (mimeType.includes('spreadsheet') || mimeType.includes('sheet') || mimeType.includes('excel')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    }
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
      return <Presentation className="w-5 h-5 text-orange-400" />;
    }
    if (mimeType.includes('image/')) {
      return <Image className="w-5 h-5 text-purple-400" />;
    }
    if (mimeType.includes('video/')) {
      return <Video className="w-5 h-5 text-rose-400" />;
    }
    return <File className="w-5 h-5 text-cyan-400" />;
  };

  // Storage percentage
  const usageBytes = parseInt(storageQuota?.usage || '0', 10);
  const limitBytes = parseInt(storageQuota?.limit || '16106127360', 10); // default 15GB
  const storagePercent = Math.min(100, Math.round((usageBytes / (limitBytes || 1)) * 100)) || 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner & Title */}
      <div className="p-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-gray-950 via-slate-900 to-gray-950 backdrop-blur-xl relative overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.12)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <HardDrive className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-mono text-white tracking-wide">
                  GOOGLE DRIVE CLOUD MATRIX
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-700">
                  WORKSPACE v3
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Browse, search, upload and manage files with MAYRA voice control
              </p>
            </div>
          </div>

          {/* User Profile or Sign In */}
          {!needsAuth && user ? (
            <div className="flex items-center gap-3 bg-gray-900/90 border border-cyan-900/60 p-2.5 rounded-xl">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Google User'}
                  className="w-9 h-9 rounded-full border border-cyan-500/50"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-cyan-900 text-cyan-200 flex items-center justify-center font-bold text-sm">
                  {user.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <div className="text-left font-mono">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{user.displayName || 'Connected User'}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                  {user.email}
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 ml-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
                title="Sign out of Google"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoggingIn}
              className="gsi-material-button flex items-center gap-3 px-5 py-3 rounded-xl bg-white text-gray-900 font-medium text-sm hover:bg-gray-100 transition shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          )}
        </div>

        {/* Live Storage Meter (if authenticated) */}
        {!needsAuth && storageQuota && (
          <div className="mt-5 pt-4 border-t border-cyan-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="text-slate-400">Google Drive Storage:</span>
              <span className="text-white font-bold">
                {formatBytes(usageBytes)} of {formatBytes(limitBytes)} used ({storagePercent}%)
              </span>
            </div>
            <div className="w-full sm:w-64 h-2 bg-gray-900 rounded-full overflow-hidden border border-cyan-900/50">
              <div
                className={`h-full transition-all duration-500 ${
                  storagePercent > 85 ? 'bg-rose-500' : storagePercent > 60 ? 'bg-amber-400' : 'bg-cyan-400'
                }`}
                style={{ width: `${storagePercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {needsAuth ? (
        <div className="p-12 rounded-2xl border border-cyan-500/20 bg-gray-950/80 backdrop-blur-xl text-center flex flex-col items-center justify-center space-y-5">
          <div className="w-20 h-20 rounded-full bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
            <HardDrive className="w-10 h-10" />
          </div>
          <div className="max-w-md space-y-2">
            <h3 className="text-lg font-bold font-mono text-white">
              Connect Google Drive with MAYRA
            </h3>
            <p className="text-xs text-slate-400 font-mono leading-relaxed">
              Google Drive connects with permission from your Google Account to securely display files, spreadsheets, docs, and storage quota directly within MAYRA.
            </p>
          </div>
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoggingIn}
            className="flex items-center gap-3 px-6 py-3.5 rounded-xl bg-white text-gray-900 font-semibold text-sm hover:bg-gray-100 transition shadow-[0_0_25px_rgba(255,255,255,0.25)]"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Controls Bar: Search, Filters & Actions */}
          <div className="p-4 rounded-xl border border-cyan-900/60 bg-gray-950/80 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Google Drive..."
                className="w-full bg-gray-900 border border-cyan-900 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </form>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              {[
                { id: 'all', label: 'All' },
                { id: 'folder', label: 'Folders' },
                { id: 'document', label: 'Docs/PDF' },
                { id: 'spreadsheet', label: 'Sheets' },
                { id: 'presentation', label: 'Slides' },
                { id: 'media', label: 'Media' },
                { id: 'starred', label: 'Starred' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition ${
                    activeFilter === tab.id
                      ? 'bg-cyan-500 text-gray-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                      : 'bg-gray-900 text-slate-400 hover:text-white border border-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Action Buttons: New Folder, Upload, Refresh */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                onClick={() => setShowFolderModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 border border-cyan-800 text-xs text-cyan-300 font-mono hover:bg-cyan-950 transition"
                title="New Folder"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Folder</span>
              </button>

              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 text-gray-950 text-xs font-bold font-mono hover:bg-cyan-400 transition cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedUploadFile(e.target.files[0]);
                    }
                  }}
                />
              </label>

              <button
                onClick={() => token && loadDriveData(token, currentFolderId, activeFilter, searchQuery)}
                disabled={loading}
                className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-slate-400 hover:text-cyan-400 transition"
                title="Refresh Files"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1.5 px-2 text-xs font-mono text-slate-400">
            {folderHistory.map((item, index) => (
              <React.Fragment key={item.id}>
                {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
                <button
                  onClick={() => handleNavigateBreadcrumb(index)}
                  className={`hover:text-cyan-300 transition ${
                    index === folderHistory.length - 1 ? 'text-white font-bold' : ''
                  }`}
                >
                  {item.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* File Grid */}
          {loading ? (
            <div className="p-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <div className="text-xs font-mono text-slate-400">Loading Google Drive files...</div>
            </div>
          ) : files.length === 0 ? (
            <div className="p-16 rounded-xl border border-gray-800 bg-gray-950/60 text-center space-y-3">
              <Folder className="w-12 h-12 text-slate-600 mx-auto" />
              <div className="text-sm font-bold text-slate-300 font-mono">No files found</div>
              <div className="text-xs text-slate-500 font-mono">
                {searchQuery
                  ? 'No files matching query: ' + searchQuery
                  : 'This folder is currently empty.'}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {files.map((file) => {
                const isFolder = file.mimeType === 'application/vnd.google-apps.folder';

                return (
                  <div
                    key={file.id}
                    className="p-3.5 rounded-xl border border-cyan-950 bg-gray-900/60 hover:bg-gray-900/90 hover:border-cyan-500/40 transition group flex flex-col justify-between space-y-3 relative overflow-hidden"
                  >
                    {/* Header: Icon, Name, Star */}
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-lg bg-gray-950 border border-gray-800 shrink-0">
                        {getFileIcon(file.mimeType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => (isFolder ? handleFolderClick(file) : window.open(file.webViewLink, '_blank'))}
                          className="text-xs font-bold font-mono text-slate-200 hover:text-cyan-300 truncate block text-left w-full"
                          title={file.name}
                        >
                          {file.name}
                        </button>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                          <span>{isFolder ? 'Folder' : formatBytes(file.size)}</span>
                          {file.modifiedTime && (
                            <span>• {new Date(file.modifiedTime).toLocaleDateString('hi-IN')}</span>
                          )}
                        </div>
                      </div>

                      {/* Star Button */}
                      <button
                        onClick={() => handleStarToggle(file)}
                        className={`p-1 rounded hover:text-amber-400 transition shrink-0 ${
                          file.starred ? 'text-amber-400' : 'text-slate-600'
                        }`}
                        title={file.starred ? 'Unstar' : 'Star file'}
                      >
                        <Star className={`w-3.5 h-3.5 ${file.starred ? 'fill-amber-400' : ''}`} />
                      </button>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-800/60 text-xs font-mono">
                      {isFolder ? (
                        <button
                          onClick={() => handleFolderClick(file)}
                          className="text-[11px] text-cyan-400 hover:text-cyan-200 flex items-center gap-1"
                        >
                          <span>Open Folder</span> &rarr;
                        </button>
                      ) : (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-cyan-400 hover:text-cyan-200 flex items-center gap-1"
                        >
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      {/* Delete File button (triggers explicit confirmation modal) */}
                      <button
                        onClick={() => setDeleteConfirmItem(file)}
                        className="text-slate-600 hover:text-rose-400 p-1 transition"
                        title="Delete file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal: Destructive Deletion */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/50 bg-gray-950 p-6 space-y-4 shadow-[0_0_50px_rgba(244,63,94,0.25)]">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="text-base font-bold font-mono text-white">
                  Confirm Permanent Deletion
                </h4>
                <p className="text-xs text-rose-300 font-mono">Google Drive Workspace Warning</p>
              </div>
            </div>

            <p className="text-xs font-mono text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <span className="font-bold text-white">&quot;{deleteConfirmItem.name}&quot;</span> from your Google Drive? This action cannot be undone.
            </p>

            <div className="p-3 rounded-lg bg-gray-900 border border-gray-800 text-xs font-mono space-y-1">
              <div className="text-slate-400">Item: <span className="text-white">{deleteConfirmItem.name}</span></div>
              <div className="text-slate-400">Type: <span className="text-white">{deleteConfirmItem.mimeType}</span></div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmItem(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg border border-gray-700 text-slate-300 text-xs font-mono hover:bg-gray-900 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white font-bold text-xs font-mono hover:bg-rose-500 transition shadow-[0_0_15px_rgba(244,63,94,0.4)]"
              >
                {isDeleting ? 'Deleting...' : 'Delete File'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Upload File */}
      {selectedUploadFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-cyan-500/50 bg-gray-950 p-6 space-y-4 shadow-[0_0_50px_rgba(6,182,212,0.25)]">
            <div className="flex items-center gap-3 text-cyan-400">
              <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40">
                <Upload className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="text-base font-bold font-mono text-white">
                  Confirm File Upload
                </h4>
                <p className="text-xs text-cyan-300 font-mono">Upload to {folderHistory[folderHistory.length - 1].name}</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-gray-900 border border-gray-800 text-xs font-mono space-y-1">
              <div className="text-slate-400">File Name: <span className="text-white font-bold">{selectedUploadFile.name}</span></div>
              <div className="text-slate-400">File Size: <span className="text-white">{formatBytes(selectedUploadFile.size)}</span></div>
              <div className="text-slate-400">File Type: <span className="text-white">{selectedUploadFile.type || 'Unknown'}</span></div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedUploadFile(null)}
                disabled={isUploading}
                className="px-4 py-2 rounded-lg border border-gray-700 text-slate-300 text-xs font-mono hover:bg-gray-900 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleFileUploadConfirm}
                disabled={isUploading}
                className="px-4 py-2 rounded-lg bg-cyan-500 text-gray-950 font-bold text-xs font-mono hover:bg-cyan-400 transition shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              >
                {isUploading ? 'Uploading...' : 'Confirm Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Folder */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form
            onSubmit={handleCreateFolder}
            className="w-full max-w-md rounded-2xl border border-cyan-500/50 bg-gray-950 p-6 space-y-4 shadow-[0_0_50px_rgba(6,182,212,0.25)]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FolderPlus className="w-5 h-5 text-cyan-400" />
                <h4 className="text-base font-bold font-mono text-white">Create New Folder</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowFolderModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder Name (e.g. YouTube Projects)..."
              autoFocus
              className="w-full bg-gray-900 border border-cyan-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowFolderModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-700 text-slate-300 text-xs font-mono hover:bg-gray-900 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreatingFolder || !newFolderName.trim()}
                className="px-4 py-2 rounded-lg bg-cyan-500 text-gray-950 font-bold text-xs font-mono hover:bg-cyan-400 transition disabled:opacity-40"
              >
                {isCreatingFolder ? 'Creating...' : 'Create Folder'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
