
# git-local-info

| Fork of <https://github.com/ycjcl868/git-local-info>

## Badges

[![npm package](https://img.shields.io/npm/v/git-local-info.svg?style=flat-square)](https://www.npmjs.org/package/git-local-info)

--------------------

## gitInfo

Retrieves repo information without relying on the `git` command.

### Usage

[![git-local-info](https://nodei.co/npm/git-local-info.png)](https://npmjs.org/package/git-local-info)

```javascript
import GitInfo from 'git-local-info';


const gitInfo = new GitInfo();

const result = gitInfo.getGitInfo;

// result is:
{
  /** The current branch */
  branch: string;
  /** The current repository url */
  repository: string;
  /** SHA of the current commit */
  sha: string;
  /** The committer of the current SHA */
  commit: ICommit;
  /** The commit message for the current SHA */
  rootDir: string;
}

```

### Params

new GitInfo(params);

```js
// params
{
  // default process.cwd()
  gitPath: process.cwd(),
  // default .git
  GIT_DIR: '.git',
}
```

### Screenshot

![image](https://user-images.githubusercontent.com/13595509/51222175-90a44c80-1977-11e9-81f7-e732e86c38de.png)
