import YAML from "yaml";
import path from "path";
import fs from "fs";
import preRelease from "./domain/pre-release";
import changeLog from "./domain/change-log";
import gitService from "./services/git-services";
import yargs from "yargs";
import semver from "semver";
import Promise from "bluebird";

const writeFile = Promise.promisify(fs.writeFile);
const readFile = Promise.promisify(fs.readFile);

class UserError extends Error {
  constructor(...args) {
    super(...args);
    this.name = "UserError";
    Error.captureStackTrace(this, this.constructor);
  }
}

function addChangeLogFilePositional(_yargs) {
  return _yargs.positional("CHANGE_LOG_FILE", {
    description:
      "The path to the change log file to read and update. If REPO_DIR is given, this path is taken relative to that.",
    default: "CHANGES.yaml",
    type: "string"
  });
}

function addRepoDirPositional(_yargs) {
  return _yargs.positional("REPO_DIR", {
    description: "The path to the root directory of your project.",
    default: ".",
    type: "string"
  });
}

function yargsBuilder(...builders) {
  return _yargs => {
    builders.forEach(b => b.bind(_yargs)(_yargs));
    return _yargs;
  };
}

export default function main(argv = process.argv.slice(2)) {
  return yargs
    .command({
      command: "update [ CHANGE_LOG_FILE [REPO_DIR] ]",
      desc:
        "Update the PreRelease in the changelog file with changes for each commit " +
        "since the last tagged release that are not already described there.",
      builder: yargsBuilder(addChangeLogFilePositional, addRepoDirPositional),
      handler: createCommonHandler(handleUpdateCommand)
    })
    .command({
      command: "prepare [ CHANGE_LOG_FILE [REPO_DIR] ]",
      desc: "Prepare a pre-release by adding a suggested version",
      builder: yargsBuilder(
        addChangeLogFilePositional,
        addRepoDirPositional,
        _yargs =>
          _yargs
            .option("use-version", {
              alias: "v",
              desc:
                "Specify a version to use, instead of using a suggested version.",
              type: "string",
              required: false
            })
            .option("overwrite-version", {
              desc:
                "Overwrite any existing version in the PreRelease with the version specified by the --use-version option",
              type: "boolean",
              implies: "use-version"
            })
            .option("allow-low-version", {
              desc:
                "Allow the use of a version specified by --use-version, even if it is too low based on the previous version and the changes described in the PreRelease",
              type: "boolean",
              implies: "use-version"
            })
      ),
      handler: createCommonHandler(handlePrepareCommand)
    })
    .command({
      command: "create-release [ CHANGE_LOG_FILE [REPO_DIR] ]",
      desc:
        "Create a new release in the change log, promoting the current PreRelease if present",
      builder: yargsBuilder(
        addChangeLogFilePositional,
        addRepoDirPositional,
        _yargs => _yargs
        // .option('tag', {
        //   desc: 'Add git tags for the created version and release number.',
        //   type: 'boolean',
        //   default: false,
        //   required: false
        // })
      ),
      handler: createCommonHandler(handleCreateReleaseCommand)
    })
    .demandCommand(1)
    .strict()
    .parse(argv);
}

function createCommonHandler(handler) {
  return args => {
    const repoDir = path.resolve(args.REPO_DIR);
    const changeLogFile = path.resolve(repoDir, args.CHANGE_LOG_FILE);
    return readFile(changeLogFile, "utf8")
      .then(content => {
        const document = YAML.parse(content);
        args.changeLog = changeLog(document.Releases);
        args.preRelease = preRelease(document.PreRelease);
        args.repoDir = repoDir;
        args.changeLogFile = changeLogFile;
        args.generateChangeLog = (cl, pr) => {
          const doc = {};
          if (pr) {
            doc.PreRelease = pr;
          }
          doc.Releases = cl || [];
          return YAML.stringify({ PreRelease: pr, Releases: cl });
        };
        args.overwriteChangeLog = (cl, pr) =>
          writeFile(args.changeLogFile, args.generateChangeLog(cl, pr), "utf8");
        return handler(args);
      })
      .catch(error => {
        if (error instanceof UserError) {
          console.error(error.message);
          process.exitCode = 1;
        } else {
          console.error(error.stack);
          process.exitCode = 2;
        }
      });
  };
}

function handleCreateReleaseCommand({
  changeLog: cl,
  preRelease: pr,
  overwriteChangeLog
}) {
  cl.addRelease(pr);
  return overwriteChangeLog(cl);
}

function handlePrepareCommand({
  changeLog: cl,
  preRelease: pr,
  overwriteChangeLog,
  useVersion,
  overwriteVersion,
  allowLowVersion
}) {
  const suggestedVersion = pr.getSuggestedVersion(
    cl.getLatestRelease().version
  );
  if (useVersion) {
    if (pr.version && !overwriteVersion) {
      throw new UserError(
        `A version was specified, but the PreRelease already has version '${pr.version}'`
      );
    }
    if (semver.lt(useVersion, suggestedVersion) && !allowLowVersion) {
      throw new UserError(
        `The version you specified is insufficient for the changes described in the PreRelease. The minimum version is ${suggestedVersion}`
      );
    }
  }
  pr.version = useVersion || pr.version || suggestedVersion;
  return overwriteChangeLog(cl, pr);
}

function handleUpdateCommand({
  repoDir,
  changeLog: cl,
  preRelease: pr,
  overwriteChangeLog
}) {
  const commitsAlreadyInPr = new Set();
  pr.changes.changes.forEach(change =>
    change.commits.forEach(commit => commitsAlreadyInPr.add(commit))
  );
  const git = gitService(repoDir);
  return git.prepareNextPreRelease().then(prepared => {
    pr.addChanges(
      prepared.changes.changes.filter(change =>
        change.commits.some(commit => !commitsAlreadyInPr.has(commit))
      )
    );
    pr.description = pr.description || prepared.description;
    return overwriteChangeLog(cl, pr);
  });
}
