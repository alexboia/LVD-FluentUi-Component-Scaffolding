const path = require('path');
const winston = require('winston');
const utils = require('./utils.js');

const ConsoleColors = {
	FgGreen: "\x1b[32m",
    FgRed: "\x1b[31m",
    FgYellow: "\x1b[33m",
	FgReset: "\x1b[0m"
};

class ComponentLogger {
	constructor(logDirectory, serviceName) {
		if (!logDirectory) {
			throw new Error('Log directory is required but not specified');
		}

		const logDirectoryNormalized = utils
			.normalizeAndEnsureDirectoryExists(logDirectory);

		this._errorLogger = this._createErrorLogger(logDirectoryNormalized, 
			serviceName);
		this._activityLogger = this._createActivityLogger(logDirectoryNormalized, 
			serviceName);
	}

	_createErrorLogger(logDirectoryNormalized, serviceName) {
		const errogLogPath = path.join(logDirectoryNormalized, 
			'error.log');

		return winston.createLogger({
			level: 'error',
			format: winston.format.combine(
				winston.format.errors({ stack: true }),
				winston.format.metadata(),
				winston.format.json(),
				winston.format.prettyPrint()
			),
			defaultMeta: { 
				service: serviceName 
			},
			transports: [
				new winston.transports.File({ 
					filename: errogLogPath, 
					level: 'error' 
				})
			]
		});
	}

	_createActivityLogger(logDirectoryNormalized, serviceName) {
		const activityLogPath = path.join(logDirectoryNormalized, 
			'activty.log');

		return winston.createLogger({
			level: 'debug',
			format: winston.format.combine(
				winston.format.metadata(),
				winston.format.json(),
				winston.format.prettyPrint()
			),
			defaultMeta: { 
				service: serviceName 
			},
			transports: [
				new winston.transports.File({ 
					filename: activityLogPath,
					level: 'debug' 
				})
			]
		});
	}

	reportNormalProgressStep(message) {
		console.log(`${ConsoleColors.FgGreen}${message}${ConsoleColors.FgReset}`);
		this.info(message);
	}

	reportProgressError(message, exception = null) {
		console.log(`${ConsoleColors.FgRed}${message}${ConsoleColors.FgReset}`);
		this.error(message, exception);
	}

	reportProgressWarning(message) {
		console.log(`${ConsoleColors.FgYellow}${message}${ConsoleColors.FgReset}`);
		this.warning(message);
	}

	info(message) {
		this._activityLogger.info(message);
	}

	debug(message) {
		this._activityLogger.debug(message);
	}

	warning(message) {
		this._activityLogger.warn(message);
	}

	error(message, exception = null) {
		this._errorLogger.error(message);
		if (exception != null) {
			this._errorLogger.error(winston.exceptions.getAllInfo(exception));
		}
	}
}

module.exports = ComponentLogger;