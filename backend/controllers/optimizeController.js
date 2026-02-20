const { optimizeCodeWithAI } = require('../services/aiService');
const { fetchFileContent, getDefaultBranch, createBranchAndCommit } = require('../services/githubService');

async function optimizeCode(req, res) {
  try {
    console.log('[optimizeCode] Request received:', { code: req.body.code?.substring(0, 100), language: req.body.language });
    const { code, language } = req.body;

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return res.status(400).json({ error: 'Code is required.' });
    }
    if (!language || typeof language !== 'string') {
      return res.status(400).json({ error: 'Language is required.' });
    }

    const result = await optimizeCodeWithAI(code.trim(), language);
    console.log('[optimizeCode] AI response received, score:', result.score);
    return res.json(result);
  } catch (err) {
    console.error('[optimizeCode]', err.message);
    return res.status(500).json({ error: err.message || 'Optimization failed.' });
  }
}

async function optimizeRepo(req, res) {
  try {
    const { repoUrl, filePath } = req.body;
    const githubToken = process.env.GITHUB_TOKEN;

    if (!repoUrl || typeof repoUrl !== 'string') {
      return res.status(400).json({ error: 'Repository URL is required.' });
    }
    if (!filePath || typeof filePath !== 'string') {
      return res.status(400).json({ error: 'File path is required.' });
    }
    if (!githubToken) {
      return res.status(500).json({ error: 'GitHub token not configured on server.' });
    }

    // Step 1: Fetch file from GitHub
    const { content, owner, repo } = await fetchFileContent(githubToken, repoUrl, filePath);

    // Detect language from extension
    const ext = filePath.split('.').pop().toLowerCase();
    const langMap = { js: 'JavaScript', ts: 'TypeScript', py: 'Python', cpp: 'C++', java: 'Java', go: 'Go' };
    const language = langMap[ext] || 'JavaScript';

    // Step 2: Optimize with AI
    const result = await optimizeCodeWithAI(content, language);

    // Step 3: Get default branch
    const defaultBranch = await getDefaultBranch(githubToken, owner, repo);

    // Step 4: Create branch and commit
    const { branchName } = await createBranchAndCommit(
      githubToken, owner, repo, filePath, result.optimizedCode, defaultBranch
    );

    return res.json({
      ...result,
      branch: branchName,
      message: `Optimized code committed to branch: ${branchName}`,
    });
  } catch (err) {
    console.error('[optimizeRepo]', err.message);
    const status = err?.response?.status || 500;
    return res.status(status).json({ error: err.message || 'Repository optimization failed.' });
  }
}

module.exports = { optimizeCode, optimizeRepo };
