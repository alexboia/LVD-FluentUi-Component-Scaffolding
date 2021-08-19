#!/usr/bin/env node
"use strict";

const yargs = require('yargs');

const ComponentLogger = require('./lib/logger.js');
const ComponentPackageBuilder = require('./lib/package-builder.js');

function run() {
	const args = _getArgs();
	const logger = _createLogger(args.logDirectory);
	try {
		const options = {
			logDirectory: args.logDirectory,
			createRoot: args.createRoot
		};

		_buildPackage(logger, options);
	} catch (e) {
		logger.reportProgressError('The package could not be created.', e);
	}
}

function _getArgs() {
	return yargs
		.option('log-directory', {
			alias: 'ld',
			type: 'string',
			description: 'Specify log directory name. Defaults to _logs',
			default: '_logs'
		})
		.option('create-root', {
			alias: 'cr',
			type: 'boolean',
			description: 'Create root component directory, use the current one instead. Defaults to false, that is use current working directory.',
			default: false
		})
		.help()
		.argv;
}

function _createLogger(logDirectory) {
	const serviceName = 'create-fluentui-component';
	return new ComponentLogger(logDirectory, serviceName);
}

function _buildPackage(logger, options) {
	const componentPackageBuilder = _createPackageBuilder(logger, options);
	logger.reportNormalProgressStep('Begin package creation...');

	componentPackageBuilder.create((success) => {
		if (success) {
			logger.reportNormalProgressStep('Completed package creation.');
		} else {
			logger.reportProgressError('The package could not be created.');
		}
	});
}

function _createPackageBuilder(logger, options) {
	const templateSourceDir = __dirname;
	const packageDestinationRootDir = './';

	return new ComponentPackageBuilder(templateSourceDir,
		packageDestinationRootDir, 
		options,
		logger);
}

run();