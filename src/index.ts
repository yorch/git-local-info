import { existsSync, readFileSync, statSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { inflateSync } from 'zlib';
import { parse as parseIni } from 'ini';
import { type IGitInfo, IGitInfoParams } from './typings';

export class GitInfo {
  get getGitInfo(): IGitInfo {
    return {
      branch: this.getBranch(),
      repository: this.getRepository(),
      sha: this.getSha(),
      commit: this.getCommit(),
      rootDir: dirname(resolve(this.gitPath)),
    };
  }

  private readonly gitPath: string;

  private readonly GIT_DIR: string = '.git';

  private readonly headPath: string;

  constructor(args: IGitInfoParams = {}) {
    const { gitPath, GIT_DIR } = args;
    if (GIT_DIR) {
      this.GIT_DIR = GIT_DIR;
    }
    this.gitPath = this._findRepo(gitPath);
    this.headPath = join(this.gitPath, 'HEAD');
  }

  // Get branch
  public getBranch(): string {
    try {
      if (existsSync(this.headPath)) {
        const headFile = this._readFile(this.headPath);
        const match = /refs\/heads\/(\S+$)/.exec(headFile);
        const branchName = match && match[1];

        return branchName;
      }
    } catch {}
  }

  // Get repository
  public getRepository(): string {
    try {
      const configFilePath = join(this.gitPath, 'config');
      if (existsSync(configFilePath)) {
        const config = parseIni(this._readFile(configFilePath));
        const repository = config['remote "origin"'].url;

        return repository;
      }
    } catch {}
  }

  // Get sha/commit hash
  public getSha(): string {
    try {
      if (existsSync(this.headPath)) {
        const headFile = readFileSync(this.headPath, 'utf-8');
        let refPath = headFile.split(' ')[1];
        // Find branch and SHA
        if (refPath) {
          refPath = refPath.trim();
          const branchPath = join(this.gitPath, refPath);
          const hasBranchPath = existsSync(branchPath);

          return hasBranchPath ? this._readFile(branchPath) : this._findPackedCommit(refPath);
        }

        let sha = headFile.split('/').slice(2).join('/').trim();
        if (!sha) {
          sha = headFile.split('/').slice(-1)[0].trim();
        }

        return sha;
      }
    } catch {}
  }

  public getCommit() {
    try {
      const sha = this.getSha();

      if (!sha) {
        return '';
      }

      const objectPath = join(this.gitPath, 'objects', sha.slice(0, 2), sha.slice(2));

      if (inflateSync && existsSync(objectPath)) {
        const objectContents = inflateSync(readFileSync(objectPath)).toString();
        const commit = objectContents
          .split(/\0|\r?\n/)
          .filter(Boolean)
          .reduce((data: any, section) => {
            const part = section.slice(0, section.indexOf(' ')).trim();

            switch (part) {
              case 'commit':
              case 'tag':
              case 'object':
              case 'type':
              case 'author':
              case 'parent':
              case 'tree': {
                // ignore these for now
                break;
              }

              case 'committer': {
                const parts = section.match(/^(?:author|committer)\s(.+)\s(\d+\s(?:\+|\-)\d{4})$/);

                if (parts) {
                  data[part] = parts[1];
                }

                break;
              }

              default: {
                // Should just be the commit message left
                data.commitMessage = section;
              }
            }

            return data;
          }, {});

        return commit;
      }
    } catch {}
  }

  private _findPackedCommit(refPath: string) {
    return this._getPackedRefsForType(refPath, 'commit')[0];
  }

  private _getPackedRefsFile() {
    const packedRefsFilePath = join(this.gitPath, 'packed-refs');

    return existsSync(packedRefsFilePath) ? this._readFile(packedRefsFilePath) : false;
  }

  private _getShaBasedOnType(type: string, shaLine: string) {
    if (type === 'tag') {
      return shaLine.split('tags/')[1];
    } else if (type === 'commit') {
      return shaLine.split(' ')[0];
    }

    return '';
  }

  private _getLinesForRefPath(packedRefsFile: string, type: string, refPath: string) {
    return packedRefsFile.split(/\r?\n/).reduce((acc, line, idx, array) => {
      const targetLine = line.includes('^') ? array[idx - 1] : line;
      return this._doesLineMatchRefPath(type, line, refPath) ? acc.concat(targetLine) : acc;
    }, []);
  }

  private _doesLineMatchRefPath(type: string, line: string, refPath: string) {
    const refPrefix = type === 'tag' ? 'refs/tags' : 'refs/heads';

    return (line.includes(refPrefix) || line.includes('^')) && line.includes(refPath);
  }

  private _getPackedRefsForType(refPath: string, type: string) {
    const packedRefsFile = this._getPackedRefsFile();

    if (packedRefsFile) {
      return this._getLinesForRefPath(packedRefsFile, type, refPath).map((shaLine) =>
        this._getShaBasedOnType(type, shaLine)
      );
    }

    return [];
  }

  private _readFile(filePath: string): string {
    return readFileSync(filePath, 'utf-8').trim();
  }

  private _findRepoHandleLinkedWorktree(gitPath: string) {
    const stat = statSync(gitPath);

    if (stat.isDirectory()) {
      return gitPath;
    }
    // We have a file that tells us where to find the worktree git dir.  Once we
    // look there we'll know how to find the common git dir, depending on
    // whether it's a linked worktree git dir, or a submodule dir

    const linkedGitDir = readFileSync(gitPath).toString();
    const absolutePath = resolve(dirname(gitPath));
    const worktreeGitDirUnresolved = /gitdir: (.*)/.exec(linkedGitDir)[1];
    const worktreeGitDir = resolve(absolutePath, worktreeGitDirUnresolved);

    return worktreeGitDir;
  }

  private _findRepo(startingPath: string): string {
    let lastPath: string;
    let currentPath = startingPath || process.cwd();

    do {
      const gitPath = join(currentPath, this.GIT_DIR);

      if (existsSync(gitPath)) {
        return this._findRepoHandleLinkedWorktree(gitPath);
      }

      lastPath = currentPath;
      currentPath = resolve(currentPath, '..');
    } while (lastPath !== currentPath);

    return '';
  }
}

export { type IGitInfo, type IGitInfoParams } from './typings';
