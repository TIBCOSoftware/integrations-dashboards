// Created by huanli<huali@tibco-support.com> on 3/9/17.
const logger = {};

/**
 * Print out the message in a specific format with the provided arguments.
 *
 * @param {string} logLevel Should be one of "INFO", "WARN", "ERROR", and
 * "DEBUG". Otherwise, nothing will be printed out.
 * @param {string} message A meaningful message for then user.
 * @param {object} error Optional. The error object which contains more
 *   specific information about the error.
 */
logger.log = (logLevel, message, error) => {
  if (
    Object.keys(logger.logLevels).some(key => {
      return logger.logLevels[key] === logLevel;
    })
  ) {
    const logMessage = message || '';
    const logError = error || '';
    console.log(logger.formatTime(new Date()), logLevel, logMessage, logError);
  }
};

logger.logLevels = {
  LOG_ERROR: 'ERROR',
  LOG_WARN: 'WARN',
  LOG_INFO: 'INFO',
  LOG_DEBUG: 'DEBUG'
};

logger.logError = (message, error) => {
  logger.log(logger.logLevels.LOG_ERROR, message, error);
};

logger.logWarn = (message, error) => {
  logger.log(logger.logLevels.LOG_WARN, message, error);
};

logger.logInfo = (message, error) => {
  logger.log(logger.logLevels.LOG_INFO, message, error);
};

logger.logDebug = (message, error) => {
  logger.log(logger.logLevels.LOG_DEBUG, message, error);
};

logger.pad2Digits = num => {
  return num < 10 ? `0${num}` : num;
};

logger.pad3Digits = ms => {
  if (ms < 10) {
    return `00${ms}`;
  }
  if (ms < 100) {
    return `0${ms}`;
  }
  return ms;
};

logger.formatTime = date => {
  return `${logger.pad2Digits(date.getUTCHours())}:${logger.pad2Digits(date.getUTCMinutes())}:${logger.pad2Digits(
    date.getUTCSeconds()
  )}.${logger.pad3Digits(date.getUTCMilliseconds())}`;
};

module.exports = logger;
