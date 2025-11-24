import { Dropbox } from "dropbox";

export function getDropboxClient(accessToken: string) {
  return new Dropbox({ accessToken });
}

export async function createDropboxFolder(
  accessToken: string,
  folderName: string
) {
  const dbx = getDropboxClient(accessToken);

  const response = await dbx.filesCreateFolderV2({
    path: `/${folderName}`,
    autorename: true,
  });

  return {
    id: response.result.metadata.id,
    name: response.result.metadata.name,
    path: response.result.metadata.path_display || `/${folderName}`,
    url: `https://www.dropbox.com/home${response.result.metadata.path_display || `/${folderName}`}`,
  };
}

export async function shareDropboxFolder(
  accessToken: string,
  folderPath: string,
  email: string
) {
  const dbx = getDropboxClient(accessToken);

  // First, get the shared link settings
  const sharedLinkSettings = await dbx.sharingCreateSharedLinkWithSettings({
    path: folderPath,
    settings: {
      requested_visibility: { ".tag": "public" },
    },
  });

  // Then add the member
  await dbx.sharingAddFolderMember({
    shared_folder_id: sharedLinkSettings.result.shared_folder_id,
    members: [
      {
        member: { ".tag": "email", email },
        access_level: { ".tag": "editor" },
      },
    ],
    quiet: true,
  });

  return { success: true };
}

export async function revokeDropboxAccess(
  accessToken: string,
  folderPath: string,
  email: string
) {
  const dbx = getDropboxClient(accessToken);

  // Get shared folder ID
  const sharedFolders = await dbx.sharingListFolders();
  const folder = sharedFolders.result.entries.find(
    (f) => f.path_lower === folderPath.toLowerCase()
  );

  if (folder) {
    // Get members
    const members = await dbx.sharingListFolderMembers({
      shared_folder_id: folder.shared_folder_id,
    });

    // Find member by email
    const member = members.result.users.find(
      (m) => m.user.email === email
    );

    if (member) {
      await dbx.sharingRemoveFolderMember({
        shared_folder_id: folder.shared_folder_id,
        member: { ".tag": "email", email },
        leave_a_copy: false,
      });
    }
  }

  return { success: true };
}

export async function listDropboxFiles(
  accessToken: string,
  folderPath: string
) {
  const dbx = getDropboxClient(accessToken);

  const response = await dbx.filesListFolder({
    path: folderPath,
  });

  return response.result.entries.map((entry) => ({
    id: entry.id,
    name: entry.name,
    path: entry.path_display,
    isFolder: entry[".tag"] === "folder",
    modified: entry.client_modified || entry.server_modified,
  }));
}

