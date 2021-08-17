"use strict";

const ComponentTemplate = require('./lib/template.js');
const ComponentPackage = require('./lib/package.js');

function run() {
	try {
		const componentTemplate = new ComponentTemplate(__dirname);
		const componentPackage = new ComponentPackage('.', componentTemplate.read());
		componentPackage.create();
	} catch (e) {
		console.error('An error occurred while creating the package.');
		console.error(e);
	}
}

run();