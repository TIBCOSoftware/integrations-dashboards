const fs = require('fs');
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
  const environment = process.argv[2] || 'development';

  if (!['development', 'production', 'sandbox'].includes(environment)) {
    console.log('Please specify one of the following environments: development, production, sandbox');
    return;
  }

  _.map(taskList, taskName => {
    buildAgent.createZipFile(taskName, environment);
  });
};

buildAgent.createZipFile = (taskName, environment) => {
  console.log(taskName, environment);

  /**
   * 1. First, determine the correct .env file
   * 2. Write TASK_NAME to .env file
   * 3. then run bash zip command, send to deploy/${taskName}/app.zip
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
