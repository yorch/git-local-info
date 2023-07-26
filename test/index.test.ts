import { join } from 'path';
import { afterEach, assert, describe, it } from 'vitest';
import GitInfo from '../src';

const root = process.cwd();
const testFixturesPath = join(__dirname, 'fixtures');
const gitDir = 'dot-git';

describe('git-repo-info', () => {
  afterEach(() => {
    process.chdir(root);
  });

  describe('repoInfo', () => {
    it('returns an object with repo info', () => {
      const project = 'branch-with-slashes';
      const repoRoot = join(testFixturesPath, project);
      const localGitDir = join(repoRoot, gitDir);
      const gitInfo = new GitInfo({
        GIT_DIR: gitDir,
        gitPath: localGitDir,
      });
      const result = gitInfo.getGitInfo;
      const repository = `https://github.com/abc/${project}.git`;

      assert.deepEqual(result, {
        branch: 'feature/branch/with/slashes',
        sha: '5359aabd3872d9ffd160712e9615c5592dfe6745',
        commit: undefined,
        rootDir: repoRoot,
        repository,
      });
    });

    it('returns an object with repo info', () => {
      const project = 'commit-packed';
      const repoRoot = join(testFixturesPath, project);
      const localGitDir = join(repoRoot, gitDir);
      const gitInfo = new GitInfo({
        GIT_DIR: gitDir,
        gitPath: localGitDir,
      });
      const result = gitInfo.getGitInfo;
      const repository = `https://github.com/abc/${project}.git`;

      assert.deepEqual(result, {
        branch: 'develop',
        sha: 'd670460b4b4aece5915caf5c68d12f560a9fe3e4',
        commit: undefined,
        rootDir: repoRoot,
        repository,
      });
    });

    it('returns an object with repo info', () => {
      const project = 'detached-head';
      const repoRoot = join(testFixturesPath, project);
      const localGitDir = join(repoRoot, gitDir);
      const gitInfo = new GitInfo({
        GIT_DIR: gitDir,
        gitPath: localGitDir,
      });
      const result = gitInfo.getGitInfo;
      const repository = `https://github.com/abc/${project}.git`;

      assert.deepEqual(result, {
        branch: null,
        sha: '9dac893d5a83c02344d91e79dad8904889aeacb1',
        commit: undefined,
        rootDir: repoRoot,
        repository,
      });
    });

    it('returns an object with repo info', () => {
      const repoRoot = join(testFixturesPath, 'linked-worktree');
      process.chdir(join(repoRoot, 'linked'));
      const gitInfo = new GitInfo({
        GIT_DIR: gitDir,
      });
      const result = gitInfo.getGitInfo;
      const repository = 'https://github.com/abc/linked-worktree.git';

      assert.deepEqual(result, {
        branch: null,
        sha: '409372f3bd07c11bfacee3963f48571d675268d7',
        commit: undefined,
        rootDir: join(repoRoot, 'dot-git', 'worktrees'),
        repository,
      });
    });

    it('returns an object with repo info', () => {
      const project = 'nested-repo';
      const repoRoot = join(testFixturesPath, project);
      const localGitDir = join(repoRoot, gitDir);
      const gitInfo = new GitInfo({
        GIT_DIR: gitDir,
        gitPath: localGitDir,
      });
      const result = gitInfo.getGitInfo;
      const repository = `https://github.com/abc/${project}.git`;

      assert.deepEqual(result, {
        branch: 'master',
        sha: '5359aabd3872d9ffd160712e9615c5592dfe6745',
        commit: undefined,
        rootDir: repoRoot,
        repository,
      });
    });

    it('returns an object with repo info', () => {
      const repoRoot = join(testFixturesPath, 'tag-on-parent');
      const localGitDir = join(repoRoot, gitDir);
      const gitInfo = new GitInfo({
        GIT_DIR: gitDir,
        gitPath: localGitDir,
      });
      const result = gitInfo.getGitInfo;

      assert.deepEqual(result, {
        branch: 'master',
        sha: 'fb26504da0ed5cd9ed366f7428c06a8433fd76e6',
        rootDir: repoRoot,
        commit: {
          committer: 'Lukas Kohler <lukas.kohler@ontheblueplanet.com>',
          commitMessage: 'second commit without tag',
        },
        repository: 'https://github.com/abc/tag-on-parent.git',
      });
    });

    it('returns an object with repo info', () => {
      const repoRoot = join(testFixturesPath, 'tag-on-parent-before-merge');
      const localGitDir = join(repoRoot, gitDir);
      const gitInfo = new GitInfo({
        GIT_DIR: gitDir,
        gitPath: localGitDir,
      });
      const result = gitInfo.getGitInfo;

      assert.deepEqual(result, {
        branch: 'master',
        sha: 'b60d665ae0978a7b46e2447f4c13d7909997f56c',
        rootDir: repoRoot,
        commit: {
          committer: 'Lukas Kohler <lukas.kohler@ontheblueplanet.com>',
          commitMessage: 'merge red and blue',
        },
        repository: 'https://github.com/abc/tag-on-parent-before-merge.git',
      });
    });

    it('returns an object with repo info', () => {
      const repoRoot = join(testFixturesPath, 'tagged-annotated');
      const localGitDir = join(repoRoot, gitDir);
      const gitInfo = new GitInfo({
        GIT_DIR: gitDir,
        gitPath: localGitDir,
      });
      const result = gitInfo.getGitInfo;

      assert.deepEqual(result, {
        branch: 'master',
        sha: 'c1ee41c325d54f410b133e0018c7a6b1316f6cda',
        rootDir: repoRoot,
        commit: {
          committer: 'Robert Jackson <robert.w.jackson@me.com>',
          commitMessage: 'Initial commit.',
        },
        repository: 'https://github.com/abc/tagged-annotated.git',
      });
    });

    it('returns an object with repo info', () => {
      const repoRoot = join(testFixturesPath, 'tagged-commit-mixed-packing');
      const localGitDir = join(repoRoot, gitDir);
      const gitInfo = new GitInfo({
        GIT_DIR: gitDir,
        gitPath: localGitDir,
      });
      const result = gitInfo.getGitInfo;

      assert.deepEqual(result, {
        branch: 'master',
        sha: '37ece7ad9ded5f2312bb6be8d0c21ecebca088ac',
        rootDir: repoRoot,
        commit: {
          committer: 'Jack Rowlingson <jrowlingson@esri.com>',
          commitMessage: 'initial commit',
        },
        repository: 'https://github.com/abc/tagged-commit-mixed-packing.git',
      });
    });

    it('returns an object with repo info', () => {
      const repoRoot = join(testFixturesPath, 'tagged-commit-packed');
      const localGitDir = join(repoRoot, gitDir);
      const gitInfo = new GitInfo({
        GIT_DIR: gitDir,
        gitPath: localGitDir,
      });
      const result = gitInfo.getGitInfo;

      assert.deepEqual(result, {
        branch: 'master',
        sha: '5359aabd3872d9ffd160712e9615c5592dfe6745',
        rootDir: repoRoot,
        commit: undefined,
        repository: 'https://github.com/abc/tagged-commit-packed.git',
      });
    });

    it('returns an object with repo info', () => {
      const repoRoot = join(testFixturesPath, 'tagged-commit-packed-annotated');
      const localGitDir = join(repoRoot, gitDir);
      const gitInfo = new GitInfo({
        GIT_DIR: gitDir,
        gitPath: localGitDir,
      });
      const result = gitInfo.getGitInfo;

      assert.deepEqual(result, {
        branch: 'master',
        sha: '5359aabd3872d9ffd160712e9615c5592dfe6745',
        rootDir: repoRoot,
        commit: undefined,
        repository: 'https://github.com/abc/tagged-commit-packed-annotated.git',
      });
    });

    it('returns an object with repo info', () => {
      const repoRoot = join(testFixturesPath, 'tagged-commit-unpacked');
      const localGitDir = join(repoRoot, gitDir);
      const gitInfo = new GitInfo({
        GIT_DIR: gitDir,
        gitPath: localGitDir,
      });
      const result = gitInfo.getGitInfo;

      assert.deepEqual(result, {
        branch: 'master',
        sha: 'c1ee41c325d54f410b133e0018c7a6b1316f6cda',
        rootDir: repoRoot,
        commit: {
          committer: 'Robert Jackson <robert.w.jackson@me.com>',
          commitMessage: 'Initial commit.',
        },
        repository: 'https://github.com/abc/tagged-commit-unpacked.git',
      });
    });

    it('returns an object with repo info', () => {
      const repoRoot = join(testFixturesPath, 'tagged-commit-unpacked-no-object');
      const localGitDir = join(repoRoot, gitDir);
      const gitInfo = new GitInfo({
        GIT_DIR: gitDir,
        gitPath: localGitDir,
      });
      const result = gitInfo.getGitInfo;

      assert.deepEqual(result, {
        branch: 'master',
        sha: 'c1ee41c325d54f410b133e0018c7a6b1316f6cda',
        rootDir: repoRoot,
        commit: undefined,
        repository: 'https://github.com/abc/tagged-commit-unpacked-no-object.git',
      });
    });
  });
});
