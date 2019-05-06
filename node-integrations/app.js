require('custom-env').env(process.env.NODE_ENV || 'development');
const tasks = require('./tasks');
const scheduler = require('./util/scheduler');
const { logInfo } = require('./util/logger');

const main = async () => {
  logInfo('Node Integrations Initialized');

  // scheduler.schedule(
  //   scheduler.cron.every30Minutes,
  //   async () => {
  //     await tasks.boss2Jefe.assetIntegration.run();
  //   },
  //   'Initialize BOSS2JEFE Asset Integration'
  // );
  logInfo('########################################');
  logInfo(process.env.FOO_BAR);
  logInfo('########################################');
};

main();
