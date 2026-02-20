const axios = require('axios');

function parseRepoUrl(repoUrl) {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/|$)/);
  if (!match) throw new Error('Invalid GitHub repository URL.');
  return { owner: match[1], repo: match[2] };
}

function githubApi(token) {
  return axios.create({
    baseURL: 'https://api.github.com',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    timeout: 30000,
  });
}

async function fetchFileContent(token, repoUrl, filePath) {
  const { owner, repo } = parseRepoUrl(repoUrl);
  const api = githubApi(token);

  const { data } = await api.get(`/repos/${owner}/${repo}/contents/${filePath}`);
  if (data.encoding !== 'base64') throw new Error('Unexpected file encoding from GitHub.');

  const content = Buffer.from(data.content, 'base64').toString('utf-8');
  return { content, sha: data.sha, defaultBranch: null, owner, repo };
}

async function getDefaultBranch(token, owner, repo) {
  const api = githubApi(token);
  const { data } = await api.get(`/repos/${owner}/${repo}`);
  return data.default_branch || 'main';
}

async function getLatestCommitSha(token, owner, repo, branch) {
  const api = githubApi(token);
  const { data } = await api.get(`/repos/${owner}/${repo}/git/refs/heads/${branch}`);
  return data.object.sha;
}

async function createBranchAndCommit(token, owner, repo, filePath, optimizedCode, defaultBranch) {
  const api = githubApi(token);

  // Sanitize branch name
  const safeName = filePath.replace(/[^a-zA-Z0-9._-]/g, '_');
  const branchName = `optimized/${safeName}`;

  // Get latest SHA of default branch
  const latestSha = await getLatestCommitSha(token, owner, repo, defaultBranch);

  // Create new branch
  try {
    await api.post(`/repos/${owner}/${repo}/git/refs`, {
      ref: `refs/heads/${branchName}`,
      sha: latestSha,
    });
  } catch (err) {
    if (err?.response?.status === 422) {
      // Branch already exists — that's fine, we'll update the file on it
    } else {
      throw err;
    }
  }

  // Get current file SHA on the new branch to update it
  let fileSha;
  try {
    const { data } = await api.get(`/repos/${owner}/${repo}/contents/${filePath}`, {
      params: { ref: branchName },
    });
    fileSha = data.sha;
  } catch (e) {
    fileSha = undefined;
  }

  // Commit optimized file
  const encodedContent = Buffer.from(optimizedCode).toString('base64');
  await api.put(`/repos/${owner}/${repo}/contents/${filePath}`, {
    message: `chore: AI-optimized ${filePath}`,
    content: encodedContent,
    branch: branchName,
    ...(fileSha ? { sha: fileSha } : {}),
  });

  return { branchName, owner, repo };
}

module.exports = { fetchFileContent, getDefaultBranch, createBranchAndCommit };
