/* eslint-disable no-new */
// const { CronJob } = require('cron');
require('dotenv').config();

const tasks = require('./tasks');
const scheduler = require('./util/scheduler');
const { logInfo } = require('./util/logger');

const main = async () => {
  logInfo('Node Integrations Initialized');

  scheduler.schedule(
    scheduler.cron.every30Minutes,
    async () => {
      await tasks.boss2Jefe.assetIntegration.run();
    },
    'BOSS2JEFE Asset Integration'
  );
};

main();
