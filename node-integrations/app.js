const dotenv = require('dotenv');
const customEnv = require('custom-env');
const tasks = require('./tasks');
const scheduler = require('./util/scheduler');
const { logInfo } = require('./util/logger');

const main = async () => {
  const config = dotenv.config();

  if (config.error) {
    customEnv.env(process.env.NODE_ENV || 'development');
  }

  logInfo('Node Integrations Initialized');

  const { TASK_NAME } = process.env;

  if (TASK_NAME === 'boss2JefeAsset') {
    scheduler.schedule(
      scheduler.cron.every30Minutes,
      async () => {
        await tasks.boss2Jefe.assetIntegration.run();
      },
      'Initialize BOSS2JEFE Asset Integration'
    );
  }

  logInfo(`TASK NAME IS ${TASK_NAME} and NODE_ENV is ${process.env.NODE_ENV}`);
  logInfo('Here is process.env: ');
  logInfo(JSON.stringify(process.env, null, 2));
};

main();