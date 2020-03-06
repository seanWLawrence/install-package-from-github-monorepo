> 🛑 This package has not been published yet. You can clone this repo and use it
> now, but the `npx` script in the "Usage" section won't work yet.

# install-package-from-github-monorepo

Simple CLI to install packages from a monorepo hosted on GitHub. 

## Why this exists

- Yarn or NPM don't allow installation directly with a monorepo url yet: [#4725](https://github.com/yarnpkg/yarn/issues/4725) and
[#2974](https://github.com/npm/npm/issues/2974)
- I wasn't getting the latest results when using `https://gitpkg.now.sh` - an
    open source service that also helps with this
- I wanted the simplest possible solution with already built-in features from `GitHub`,
    `Yarn` and `NPM`

## Features

- Uses GitHub's rest API to get the package's tarball url, i.e. `https://api.github.com/repos/makeschool/create-react-app/tarball/lk1j23lkj123kjg123kl`
- Installs package with this url automatically (default) or returns the url so
    you can install yourself
- Choose between `yarn` and `npm` package managers (if auto installing)
- Easily hackable, less than 200 lines of TypeScript.

## Installation

You don't need to install it on your machine. Just use `npx` (comes pre-installed with NPM
on newer versions).

If you really want to install it, you can run:

```bash
yarn global add install
```

## Usage

Download a package using yarn (default)

```bash
npx install-package-from-github-monorepo
makeschool/create-react-app/packages/react-scripts
```

> You can also explicity pass `--package-manager yarn`

Download a package using npm

```bash
npx install-package-from-github-monorepo
makeschool/create-react-app/packages/react-scripts --package-manager npm
```

Get the installation url and then install it yourself

```bash
npx install-package-from-github-monorepo
makeschool/create-react-app/packages/react-scripts --print-only

# Returns the installation url (sha will be different)
https://api.github.com/repos/makeschool/create-react-app/tarball/lk1j23lkj123kjg123kl

yarn add https://api.github.com/repos/makeschool/create-react-app/tarball/lk1j23lkj123kjg123kl

# or NPM
# npm install https://api.github.com/repos/makeschool/create-react-app/tarball/lk1j23lkj123kjg123kl
```

Get help

```bash
npx install-package-from-github-monorepo --help
```

## Important notes

__You probably don't need this__,  unless you:
- Forked a monorepo and don't want to publish your fork (why I wrote it)
- Forked a monorepo, made some changes, and your pull request hasn't been merged
    yet. You can use this to pull the package from your fork until it's merged, and then switch back to the published package. 
- Want to use an unpublished monorepo package available on GitHub (not
    recommended unless it's your own). 

> If you just want to download a package hosted on GitHub that is _not_ a
> monorepo, you can just do something like `yarn add seanWLawrence/my-repo`
> without this tool.

__This won't keep your package up to date on its own, like semver__

You'll get the package as it is on GitHub the first time you run it, but not
after that (by default). Here's why:

When you run the CLI for the first time, this script will:
- Get the git sha for the package contents on GitHub
- Install the tarball for that sha from the GitHub API

At this point, your `package.json` file will have the sha from the package _at
this time_. And on subsequent installs, it will always pull the same package
contents, _even if the content in the repo changes_.

When you make changes to the package and push it to GitHub, the sha will be
regenerated and different from the one in your `package.json` file now.

__Fix__:

Add a `postinstall` script to run this tool after installing your packages. That
way it'll check for new content after you install your other packages, and install the latest content for you.

> Hopefully you won't have to use this package for long, but it's a nice
> workaround if you do.

```json
// package.json

"scripts": {
  "postinstall": "npx install-package-from-monorepo makeschool/create-react-app/packages/react-scripts"
}
```

## Contributing

- Create an issue and let's talk!

## License

MIT

## Credits

Written by Sean W. Lawrence. Inspired heavily by `https://gitpkg.now.sh`. 
