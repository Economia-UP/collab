import { google } from "googleapis";

export function getGoogleDriveClient(accessToken: string, refreshToken?: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/google-drive/oauth/callback`
  );

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return google.drive({ version: "v3", auth: oauth2Client });
}

export async function createGoogleDriveFolder(
  accessToken: string,
  refreshToken: string | undefined,
  folderName: string
) {
  const drive = getGoogleDriveClient(accessToken, refreshToken);

  const response = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
    },
    fields: "id, name, webViewLink, webContentLink",
  });

  return {
    id: response.data.id!,
    name: response.data.name!,
    url: response.data.webViewLink || `https://drive.google.com/drive/folders/${response.data.id}`,
  };
}

export async function shareGoogleDriveFolder(
  accessToken: string,
  refreshToken: string | undefined,
  folderId: string,
  email: string,
  role: "reader" | "writer" | "commenter" = "writer"
) {
  const drive = getGoogleDriveClient(accessToken, refreshToken);

  await drive.permissions.create({
    fileId: folderId,
    requestBody: {
      role: role,
      type: "user",
      emailAddress: email,
    },
    sendNotificationEmail: true,
  });

  return { success: true };
}

export async function revokeGoogleDriveAccess(
  accessToken: string,
  refreshToken: string | undefined,
  folderId: string,
  email: string
) {
  const drive = getGoogleDriveClient(accessToken, refreshToken);

  // Get all permissions for the folder
  const permissions = await drive.permissions.list({
    fileId: folderId,
  });

  // Find permission by email
  const permission = permissions.data.permissions?.find(
    (p) => p.emailAddress === email
  );

  if (permission && permission.id) {
    await drive.permissions.delete({
      fileId: folderId,
      permissionId: permission.id,
    });
  }

  return { success: true };
}

export async function listGoogleDriveFiles(
  accessToken: string,
  refreshToken: string | undefined,
  folderId: string
) {
  const drive = getGoogleDriveClient(accessToken, refreshToken);

  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: "files(id, name, mimeType, webViewLink, modifiedTime, size)",
    orderBy: "modifiedTime desc",
  });

  return response.data.files || [];
}

export async function refreshGoogleDriveToken(refreshToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/google-drive/oauth/callback`
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials.access_token!;
}

