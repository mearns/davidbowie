
export function createGithubCommitLinkGenerator ({username, repo}) {
  return commit => ({
    text: commit,
    url: `https://github.com/${username}/${repo}/commit/${commit}`
  })
}
