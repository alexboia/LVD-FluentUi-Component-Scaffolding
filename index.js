#!/usr/bin/env node
"use strict";

const yargs = require('yargs');

const ComponentLogger = require('./lib/logger.js');
const ComponentPackageBuilder = require('./lib/package-builder.js');

function run() {
	const args = _getArgs();
	const logger = _createLogger(args.logDirectory);
	try {
		_buildPackage(logger);
	} catch (e) {
		logger.reportProgressError('The package could not be created.', e);
	}
}

function _getArgs() {
	return yargs
		.option('log-directory', {
			alias: 'ld',
			type: 'string',
			description: 'Log directory name. Defaults to _logs',
			default: '_logs'
		})
		.help()
		.argv;
}

function _createLogger(logDirectory) {
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