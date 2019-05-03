const { CronJob } = require('cron');
const { logInfo } = require('./logger');

const scheduler = {};

scheduler.schedule = (schedule, fn, message) => {
  return new CronJob(
    schedule,
    () => {
      logInfo(message);
      fn();
    },
    null,
    true
  );
};

scheduler.cron = {
  every30Minutes: '0 */30 * * * *',
  everySecond: '* * * * * *'
};

module.exports = scheduler;
