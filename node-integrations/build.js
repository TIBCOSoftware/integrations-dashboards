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
  const environment = process.argv[2] && process.argv[2].toLowerCase();

  if (!['development', 'production', 'sandbox'].includes(environment)) {
    console.log('Usage: npm run build -- {environment}');
    console.log('Please specify one of the following environments: development, production, sandbox');
    return;
  }

  console.log('Begin building assets...');

  _.each(taskList, taskName => {
    buildAgent.createZipFile(taskName, environment);
    buildAgent.createManifestJson(taskName, environment);
  });

  console.log('Finish building assets.');
};

buildAgent.createZipFile = (taskName, environment) => {
  console.log(`Building ${taskName} for ${environment} environment...`);

  buildAgent.updateEnvFile(taskName, environment);
  buildAgent.runZipCmd(taskName, environment);
  buildAgent.resetEnvFile(taskName, environment);
};

buildAgent.updateEnvFile = (taskName, environment) => {
  const file = fs.readFileSync(`.env.${environment}`, 'utf8');
  fs.renameSync(`.env.${environment}`, `.env.${environment}.bak`);
  fs.writeFileSync(`.env.${environment}`, `${file}\nTASK_NAME=${taskName}\nNODE_ENV=${environment}`);
};

buildAgent.runZipCmd = (taskName, environment) => {
  const directory = `./deploy/${taskName}-${environment}`;
  const zipFile = `${directory}/${taskName}.zip`;

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }

  if (fs.existsSync(zipFile)) {
    fs.unlinkSync(zipFile);
  }

  const envExclusions = buildAgent.createEnvExclusions(environment);
  execSync(`zip -r ${zipFile} . --exclude "node_modules/*" "*.git*" "deploy/*" ${envExclusions}`);
};

buildAgent.createEnvExclusions = environment => {
  switch (environment) {
    case 'development':
      return '.env.sandbox .env.production .env.development.bak';
    case 'sandbox':
      return '.env.sandbox.bak .env.production .env.development';
    case 'production':
      return '.env.sandbox .env.production.bak .env.development';
    default:
      return '';
  }
};

buildAgent.resetEnvFile = (taskName, environment) => {
  fs.unlinkSync(`.env.${environment}`);
  fs.renameSync(`.env.${environment}.bak`, `.env.${environment}`);
};

buildAgent.createManifestJson = (taskName, environment) => {
  manifest.name = `${taskName}-${environment}`;
  fs.writeFileSync(`./deploy/${taskName}-${environment}/manifest.json`, JSON.stringify(manifest, null, 2));
};

buildAgent.init();
