"use strict";

const ComponentTemplate = require('./lib/template.js');
const ComponentPackage = require('./lib/package.js');
const ComponentLogger = require('./lib/logger.js');

function run() {
	const logDirectory = './_logs';
	const logger = new ComponentLogger(logDirectory);

	try {
		logger.reportNormalProgressStep('Begin package creation...');

		const templateSourceDir = __dirname;
		const componentTemplate = new ComponentTemplate(templateSourceDir, 
			logger);

		const packageDestinationRootDir = '.';
		const componentPackage = new ComponentPackage(packageDestinationRootDir, 
			componentTemplate.read(), 
			logger);

		componentPackage.create(function (success) {
			if (success) {
				logger.reportNormalProgressStep('Completed package creation.');
			} else {
				logger.reportProgressWarning('The package could not be created.');
			}
		});	
	} catch (e) {
		logger.reportProgressError('An error occured while creating the package', e);
	}
}

run();