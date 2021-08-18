"use strict";

const ComponentTemplate = require('./lib/template.js');
const ComponentPackage = require('./lib/package.js');

function run() {
	try {
		const templateSourceDir = __dirname;
		const componentTemplate = new ComponentTemplate(templateSourceDir);

		const packageDestinationRootDir = '.';
		const componentPackage = new ComponentPackage(packageDestinationRootDir, componentTemplate.read());

		componentPackage.create();
	} catch (e) {
		console.error('An error occurred while creating the package.');
		console.error(e);
	}
}

run();