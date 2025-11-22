export function validateGitHubRepo(url: string): boolean {
  const githubUrlPattern = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+(\/)?$/;
  return githubUrlPattern.test(url);
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([\w.-]+)\/([\w.-]+)/);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2],
  };
}

export async function fetchRepoMetadata(owner: string, repo: string) {
  const token = process.env.GITHUB_TOKEN;
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };

  if (token) {
    headers.Authorization = `token ${token}`;
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Repositorio no encontrado");
      }
      if (response.status === 403) {
        throw new Error("Límite de API alcanzado. Intenta más tarde.");
      }
      throw new Error("Error al obtener información del repositorio");
    }

    const data = await response.json();

    return {
      name: data.name,
      fullName: data.full_name,
      description: data.description,
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      language: data.language,
      defaultBranch: data.default_branch,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error desconocido al conectar con GitHub");
  }
}

export async function fetchRecentCommits(owner: string, repo: string, limit: number = 5) {
  const token = process.env.GITHUB_TOKEN;
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };

  if (token) {
    headers.Authorization = `token ${token}`;
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${limit}`,
      { headers }
    );

    if (!response.ok) {
      return [];
    }

    const commits = await response.json();

    return commits.map((commit: any) => ({
      sha: commit.sha.substring(0, 7),
      message: commit.commit.message.split("\n")[0],
      author: commit.commit.author.name,
      date: commit.commit.author.date,
      url: commit.html_url,
    }));
  } catch (error) {
    console.error("Error fetching commits:", error);
    return [];
  }
}

