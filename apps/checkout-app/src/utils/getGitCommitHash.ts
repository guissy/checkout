/**
 * Utility to get the current Git commit hash
 * This is used to track the exact version of the code that is running
 */

// This will be replaced at build time with the actual commit hash
const commitHash = process.env.NEXT_PUBLIC_GIT_COMMIT_HASH || 'development';

/**
 * Returns the current Git commit hash
 * @returns {string} The Git commit hash or 'development' if not available
 */
export default function getGitCommitHash(): string {
  return commitHash;
}
console.log("Git commit hash", getGitCommitHash());