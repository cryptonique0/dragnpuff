/**
 * Logging Utility
 */

const fs = require("fs");
const path = require("path");

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

class Logger {
  constructor(name, level = LOG_LEVELS.INFO) {
    this.name = name;
    this.level = level;
  }

  debug(message, data = null) {
    this._log("DEBUG", message, data);
  }

  info(message, data = null) {
    this._log("INFO", message, data);
  }

  warn(message, data = null) {
    this._log("WARN", message, data);
  }

  error(message, error = null) {
    this._log("ERROR", message, error);
  }

  _log(level, message, data) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${this.name}] ${level}: ${message}`;

    if (data) {
      console.log(logEntry, data);
    } else {
      console.log(logEntry);
    }
  }
}

function createLogger(name) {
  return new Logger(name);
}

module.exports = {
  createLogger,
  Logger,
  LOG_LEVELS,
};
