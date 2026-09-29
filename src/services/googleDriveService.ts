import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { DriveFileItem } from '../types/assistant';

export const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.activity',
  'https://www.googleapis.com/auth/drive.activity.readonly',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.apps.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.install',
  'https://www.googleapis.com/auth/drive.meet.readonly',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.photos.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.scripts',
];

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => {
  provider.addScope(scope);
});

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export interface DriveStorageQuota {
  limit?: string;
  usage?: string;
  usageInDrive?: string;
  usageInDriveTrash?: string;
}

export const fetchDriveStorageQuota = async (token: string): Promise<DriveStorageQuota | null> => {
  try {
    const res = await fetch(
      'https://www.googleapis.com/drive/v3/about?fields=storageQuota,user',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!res.ok) {
      throw new Error(`Drive about API error: ${res.status}`);
    }
    const data = await res.json();
    return data.storageQuota || null;
  } catch (err) {
    console.error('Error fetching drive storage quota:', err);
    return null;
  }
};

export const fetchDriveFiles = async (
  token: string,
  options?: {
    searchQuery?: string;
    mimeTypeFilter?: string;
    folderId?: string;
    starredOnly?: boolean;
    pageSize?: number;
  }
): Promise<{ files: DriveFileItem[]; nextPageToken?: string }> => {
  try {
    const queryParts: string[] = ['trashed = false'];

    if (options?.folderId) {
      queryParts.push(`'${options.folderId}' in parents`);
    }

    if (options?.starredOnly) {
      queryParts.push('starred = true');
    }

    if (options?.mimeTypeFilter) {
      if (options.mimeTypeFilter === 'folder') {
        queryParts.push("mimeType = 'application/vnd.google-apps.folder'");
      } else if (options.mimeTypeFilter === 'document') {
        queryParts.push(
          "(mimeType = 'application/vnd.google-apps.document' or mimeType contains 'word' or mimeType contains 'pdf')"
        );
      } else if (options.mimeTypeFilter === 'spreadsheet') {
        queryParts.push(
          "(mimeType = 'application/vnd.google-apps.spreadsheet' or mimeType contains 'sheet' or mimeType contains 'excel')"
        );
      } else if (options.mimeTypeFilter === 'presentation') {
        queryParts.push(
          "(mimeType = 'application/vnd.google-apps.presentation' or mimeType contains 'powerpoint')"
        );
      } else if (options.mimeTypeFilter === 'media') {
        queryParts.push("(mimeType contains 'image/' or mimeType contains 'video/' or mimeType contains 'audio/')");
      }
    }

    if (options?.searchQuery && options.searchQuery.trim()) {
      const sanitized = options.searchQuery.replace(/'/g, "\\'");
      queryParts.push(`name contains '${sanitized}'`);
    }

    const q = encodeURIComponent(queryParts.join(' and '));
    const pageSize = options?.pageSize || 30;
    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&pageSize=${pageSize}&fields=nextPageToken,files(id,name,mimeType,size,modifiedTime,webViewLink,iconLink,thumbnailLink,starred,owners)&orderBy=folder,modifiedTime desc`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(`Google Drive API error ${res.status}`);
    }

    const data = await res.json();
    return {
      files: data.files || [],
      nextPageToken: data.nextPageToken,
    };
  } catch (err) {
    console.error('Failed to fetch Drive files:', err);
    throw err;
  }
};

export const createDriveFolder = async (
  token: string,
  folderName: string,
  parentId?: string
): Promise<DriveFileItem> => {
  const metadata: any = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentId) {
    metadata.parents = [parentId];
  }

  const res = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!res.ok) {
    throw new Error(`Failed to create folder: ${res.status}`);
  }
  return await res.json();
};

export const uploadDriveFile = async (
  token: string,
  file: File,
  parentId?: string
): Promise<DriveFileItem> => {
  const metadata: any = {
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
  };
  if (parentId) {
    metadata.parents = [parentId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const reader = new FileReader();
  const fileDataPromise = new Promise<ArrayBuffer>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });

  const arrayBuffer = await fileDataPromise;
  const metadataBlob = new Blob([
    delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${metadata.mimeType}\r\n\r\n`,
  ]);

  const closeBlob = new Blob([closeDelimiter]);
  const multipartBody = new Blob([metadataBlob, arrayBuffer, closeBlob]);

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    }
  );

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status}`);
  }
  return await res.json();
};

export const deleteDriveFile = async (token: string, fileId: string): Promise<boolean> => {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 204) {
    throw new Error(`Delete failed: ${res.status}`);
  }
  return true;
};

export const starDriveFile = async (
  token: string,
  fileId: string,
  starred: boolean
): Promise<boolean> => {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ starred }),
  });

  if (!res.ok) {
    throw new Error(`Star update failed: ${res.status}`);
  }
  return true;
};
