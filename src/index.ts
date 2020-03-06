#!/usr/bin/env node

import spawn from "cross-spawn";
import cli from "commander";

import { Octokit } from "@octokit/rest";

let octokit = new Octokit({
  userAgent: "MakeSchool",
  baseUrl: "https://api.github.com"
});

let formatMessage =
  "\nYour github-repo-path should be formatted as `owner/repo/sub-directory-path`," +
  "\ni.e. facebook/create-react-app/packages/react-scripts";

type MainParams = {
  owner: string;
  repo: string;
  subDirectoryPath: string;
  printOnly: boolean;
  packageManager: "yarn" | "npm";
};

export default async function main({
  owner,
  repo,
  subDirectoryPath,
  printOnly,
  packageManager
}: MainParams) {
  try {
    let splitSubDirectoryPath = subDirectoryPath.split("/");
    let splitSubDirectoryPathLastIndex = splitSubDirectoryPath.length - 1;

    let contentsPath = splitSubDirectoryPath
      .slice(0, splitSubDirectoryPathLastIndex)
      .join("/");
    let packageName = splitSubDirectoryPath[splitSubDirectoryPathLastIndex];

    let { data: contents } = await octokit.repos.getContents({
      owner,
      repo,
      path: contentsPath
    });

    type ContentNode = { name: string; sha: string };

    let pkg = (contents as Array<ContentNode>).find(({ name }: ContentNode) => {
      return name === packageName;
    });

    if (!pkg) {
      wrapOutputs(
        `No package with name "${packageName}" found in GitHub repo at "${owner}/${repo}"`
      );

      process.exit(1);
    }

    let { sha } = pkg as ContentNode;

    let installationUrl = `https://api.github.com/repos/${owner}/${repo}/tarball/${sha}`;

    if (printOnly) {
      outputSpacer();

      console.log("Your installation url is:");

      wrapOutputs(installationUrl);

      outputSpacer();

      console.log(`Run "yarn add ${installationUrl}" to install your package.`);

      outputSpacer();

      process.exit(0);
    }

    new Promise((resolve, reject) => {
      wrapOutputs(`Installing your package with ${packageManager}...`);

      let args =
        packageManager === "yarn"
          ? ["add", installationUrl]
          : ["install", installationUrl];

      let child = spawn(packageManager, args, { stdio: "inherit" });

      child.on("close", code => {
        if (code !== 0) {
          reject({
            command: `${packageManager} ${args.join(" ")}`
          });
        }
        resolve();
      });
    })
      .then(() => {
        wrapOutputs("Installed successfully.");

        outputSpacer();
      })
      .catch(e => {
        wrapOutputs("Installation failed.");

        outputSpacer();

        console.error(e);
      });
  } catch (e) {
    wrapOutputs(e);
    process.exit(1);
  }
}

cli
  .version("0.0.1")
  .arguments("<github-repo-path>")
  .description(
    "Install a package from a monorepo hosted on GitHub.\n" + formatMessage
  )
  .action((gitHubRepoPath: string): void => {
    let [owner, repo, ...subDirectoryPath] = gitHubRepoPath.split("/");

    if (!owner || !repo || !subDirectoryPath.length) {
      outputSpacer();

      wrapOutputs(
        "Missing `owner`, `repo` or `sub directory path` in installation url.",
        formatMessage
      );

      outputSpacer();

      process.exit(1);
    }

    main({
      owner,
      repo,
      subDirectoryPath: subDirectoryPath.join("/"),
      printOnly: !!cli.printOnly,
      packageManager: cli.packageManager || "yarn"
    });
  });

cli
  .option("-p, --print-only", "get the installation url without installing.")
  .option(
    "-pm, --package-manager",
    "choose between `npm` and `yarn`. Default: `yarn`."
  );

cli.parse(process.argv);

function wrapOutputs(...outputs: string[]): void {
  console.log("------------------------------------");
  outputs.forEach(o => console.log(o));
  console.log("------------------------------------");
}

function outputSpacer(): void {
  console.log();
}
