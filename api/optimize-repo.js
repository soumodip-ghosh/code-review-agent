require('dotenv').config();
const { optimizeCodeWithAI } = require('../backend/services/aiService');
const { fetchFileContent, getDefaultBranch, createBranchAndCommit } = require('../backend/services/githubService');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

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

        const { content, owner, repo } = await fetchFileContent(githubToken, repoUrl, filePath);

        const ext = filePath.split('.').pop().toLowerCase();
        const langMap = { js: 'JavaScript', ts: 'TypeScript', py: 'Python', cpp: 'C++', java: 'Java', go: 'Go' };
        const language = langMap[ext] || 'JavaScript';

        const result = await optimizeCodeWithAI(content, language);
        const defaultBranch = await getDefaultBranch(githubToken, owner, repo);
        const { branchName } = await createBranchAndCommit(
            githubToken, owner, repo, filePath, result.optimizedCode, defaultBranch
        );

        return res.json({
            ...result,
            branch: branchName,
            message: `Optimized code committed to branch: ${branchName}`,
        });
    } catch (err) {
        console.error('[optimize-repo]', err.message);
        const status = err?.response?.status || 500;
        return res.status(status).json({ error: err.message || 'Repository optimization failed.' });
    }
};
