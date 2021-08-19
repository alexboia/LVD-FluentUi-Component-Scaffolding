"use strict";

const ComponentLogger = require('./lib/logger.js');
const ComponentPackageBuilder = require('./lib/package-builder.js');

function run() {
	const logger = _createLogger();
	try {
		_buildPackage(logger);
	} catch (e) {
		logger.reportProgressError('An error occured while creating the package', e);
	}
}

function _createLogger() {
	const logDirectory = './_logs';
	const serviceName = 'create-fluentui-component';
	return new ComponentLogger(logDirectory, serviceName);
}

function _buildPackage(logger) {
	const componentPackageBuilder = _createPackageBuilder(logger);
	logger.reportNormalProgressStep('Begin package creation...');

	componentPackageBuilder.create((success) => {
		if (success) {
			logger.reportNormalProgressStep('Completed package creation.');
		} else {
			logger.reportProgressError('The package could not be created.');
		}
	});
}

function _createPackageBuilder(logger) {
	const templateSourceDir = __dirname;
	const packageDestinationRootDir = './';

	return new ComponentPackageBuilder(templateSourceDir,
		packageDestinationRootDir, 
		logger);
}

run();