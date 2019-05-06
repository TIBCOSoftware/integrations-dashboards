const _ = require('lodash');
const fs = require('fs');
const { execSync } = require('child_process');
const taskList = require('./tasks/taskList');

const deployAgent = {};

deployAgent.init = () => {
  const environment = process.argv[2] && process.argv[2].toLowerCase();
  const taskName = process.argv[3];

  if (!['development', 'production', 'sandbox'].includes(environment)) {
    console.log('Usage: npm run deploy -- {environment}');
    console.log('Please specify one of the following environments: development, production, sandbox');

    return;
  }

  if (_.isNil(taskName)) {
    console.log(`No task specified. Deploying all applications for ${environment} environment.`);
    _.each(taskList, task => {
      deployAgent.deployTask(task, environment);
    });
  } else {
    deployAgent.deployTask(taskName, environment);
  }
};

deployAgent.deployTask = (taskName, environment) => {
  console.log(`Deploying ${taskName} for ${environment} environment...`);

  const directory = `./deploy/${taskName}-${environment}`;

  if (!fs.existsSync(directory)) {
    console.log(`Invalid task name: ${taskName}`);
    console.log(`Directory ${directory} could not be found`);

    return;
  }

  execSync(`cd ${directory} && tibcli app push`, { stdio: 'inherit' });
};

deployAgent.init();
