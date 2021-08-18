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
	constructor(logDirectory) {
		if (!logDirectory) {
			throw new Error('Log directory is required but not specified');
		}

		const logDirectoryNormalized = utils
			.normalizeAndEnsureDirectoryExists(logDirectory);

		const errogLogPath = path.join(logDirectoryNormalized, 
			'error.log');

		const activityLogPath = path.join(logDirectoryNormalized, 
			'activty.log');

		this.logger = winston.createLogger({
			level: 'debug',
			format: winston.format.combine(
				winston.format.errors({ stack: true }),
				winston.format.metadata(),
				winston.format.json(),
				winston.format.prettyPrint()
			),
			defaultMeta: { 
				service: 'user-service' 
			},
			transports: [
				new winston.transports.File({ 
					filename: errogLogPath, 
					level: 'error' 
				}),
				new winston.transports.File({ 
					filename: activityLogPath
				}),
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
		this.logger.info(message);
	}

	debug(message) {
		this.logger.debug(message);
	}

	warning(message) {
		this.logger.warn(message);
	}

	error(message, exception = null) {
		this.logger.error(message);
		if (exception != null) {
			this.logger.error(winston.exceptions.getAllInfo(exception));
		}
	}
}

module.exports = ComponentLogger;