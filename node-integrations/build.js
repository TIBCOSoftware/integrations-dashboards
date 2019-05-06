const fs = require('fs');
const { execSync } = require('child_process');
const _ = require('lodash');
const manifest = require('./manifest.json');
const taskList = require('./tasks/taskList');

const buildAgent = {};

/**
 * Run with npm run build -- {environment}
 * Environment can be development, sandbox, or production
 * Defaults to development
 */
buildAgent.init = () => {
  const environment = process.argv[2].toLowerCase() || 'development';

  if (!['development', 'production', 'sandbox'].includes(environment)) {
    console.log('Please specify one of the following environments: development, production, sandbox');
    return;
  }
  execSync('node -v', { stdio: 'inherit' });

  // _.map(taskList, taskName => {
  //   buildAgent.createZipFile(taskName, environment);
  //   buildAgent.createManifestJson(taskName, environment);
  // });
};

buildAgent.createZipFile = (taskName, environment) => {
  console.log(`Building ${taskName} for ${environment} environment...`);

  buildAgent.updateEnvFile(taskName, environment);
  buildAgent.runZipCmd(taskName, environment);
  buildAgent.resetEnvFile(taskName, environment);

  /**
   * 1. First, determine the correct .env file
   * 2. Write TASK_NAME to .env file
   * 3. then run bash zip command, send to deploy/${taskName}/app.zip
   * 4. reset env files
   */
};

buildAgent.updateEnvFile = (taskName, environment) => {
  const file = fs.readFileSync(`.env.${environment}`, 'utf8');
  fs.renameSync(`.env.${environment}`, `.env.${environment}.bak`);
  fs.writeFileSync(`.env.${environment}`, `${file}\nTASK_NAME=${taskName}`);
  console.log(file);
  console.log(`${file}\nTASK_NAME=${taskName}`);
};

buildAgent.runZipCmd = (taskName, environment) => {
  /**
   * 1. determine env files to ignore
   * 2. run "zip -r ./deploy/${taskName}/app.zip . --exclude \"node_modules/*\" \"*.git*\" \"deploy/*\" "THAT OTHER ENV STUFF"",
   */
};

buildAgent.resetEnvFile = (taskName, environment) => {
  fs.unlinkSync(`.env.${environment}`);
  fs.renameSync(`.env.${environment}.bak`, `.env.${environment}`);
  /**
   * 1. Delete .env.${environment}
   * 2. rename .env.${environment}.bak to .env.${environment}
   */
};

buildAgent.createManifestJson = taskName => {
  /**
   * 1. update name based on taskName
   * 2. write to deploy/${taskName}/manifest.json
   *
   */
};

buildAgent.init();
