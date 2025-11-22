export function validateOverleafUrl(url: string): boolean {
  const overleafUrlPattern = /^https?:\/\/(www\.)?(overleaf\.com|sharelatex\.com)\/project\/[\w-]+(\/)?$/;
  return overleafUrlPattern.test(url);
}

export function parseOverleafUrl(url: string): string | null {
  const match = url.match(/(?:overleaf|sharelatex)\.com\/project\/([\w-]+)/);
  if (!match) return null;
  return match[1];
}

export async function fetchProjectMetadata(projectId: string) {
  // Note: Overleaf API requires authentication and may not be publicly available
  // This is a placeholder implementation
  // In production, you would need to use Overleaf's API with proper authentication
  
  try {
    // For now, we'll just validate the URL and return basic info
    // Full implementation would require Overleaf API access
    return {
      projectId,
      name: `Project ${projectId}`,
      lastModified: new Date().toISOString(),
      collaborators: 0,
    };
  } catch (error) {
    throw new Error("Error al obtener información del proyecto de Overleaf");
  }
}

