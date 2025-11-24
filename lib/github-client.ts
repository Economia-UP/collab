import { Octokit } from "@octokit/rest";

export function getGitHubClient(accessToken?: string | null): Octokit | null {
  if (!accessToken) {
    // Fallback to environment token if available
    const envToken = process.env.GITHUB_TOKEN;
    if (!envToken) return null;
    
    return new Octokit({
      auth: envToken,
    });
  }

  return new Octokit({
    auth: accessToken,
  });
}

export async function getGitHubRepos(accessToken: string) {
  const octokit = getGitHubClient(accessToken);
  if (!octokit) throw new Error("GitHub client not available");

  const { data } = await octokit.repos.listForAuthenticatedUser({
    sort: "updated",
    per_page: 100,
  });

  return data.map((repo) => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    owner: repo.owner.login,
    description: repo.description,
    private: repo.private,
    url: repo.html_url,
    defaultBranch: repo.default_branch,
  }));
}

export async function createGitHubWebhook(
  accessToken: string,
  owner: string,
  repo: string,
  webhookUrl: string,
  secret: string
) {
  const octokit = getGitHubClient(accessToken);
  if (!octokit) throw new Error("GitHub client not available");

  const { data } = await octokit.repos.createWebhook({
    owner,
    repo,
    name: "web",
    active: true,
    events: ["push", "issues", "pull_request"],
    config: {
      url: webhookUrl,
      content_type: "json",
      secret: secret,
      insecure_ssl: "0",
    },
  });

  return data;
}

export async function deleteGitHubWebhook(
  accessToken: string,
  owner: string,
  repo: string,
  hookId: number
) {
  const octokit = getGitHubClient(accessToken);
  if (!octokit) throw new Error("GitHub client not available");

  await octokit.repos.deleteWebhook({
    owner,
    repo,
    hook_id: hookId,
  });
}

export async function addGitHubCollaborator(
  accessToken: string,
  owner: string,
  repo: string,
  username: string,
  permission: "pull" | "push" | "admin" = "push"
) {
  const octokit = getGitHubClient(accessToken);
  if (!octokit) throw new Error("GitHub client not available");

  await octokit.repos.addCollaborator({
    owner,
    repo,
    username,
    permission,
  });
}

export async function removeGitHubCollaborator(
  accessToken: string,
  owner: string,
  repo: string,
  username: string
) {
  const octokit = getGitHubClient(accessToken);
  if (!octokit) throw new Error("GitHub client not available");

  await octokit.repos.removeCollaborator({
    owner,
    repo,
    username,
  });
}

export async function createGitHubIssue(
  accessToken: string,
  owner: string,
  repo: string,
  title: string,
  body?: string,
  labels?: string[]
) {
  const octokit = getGitHubClient(accessToken);
  if (!octokit) throw new Error("GitHub client not available");

  const { data } = await octokit.issues.create({
    owner,
    repo,
    title,
    body,
    labels,
  });

  return data;
}

