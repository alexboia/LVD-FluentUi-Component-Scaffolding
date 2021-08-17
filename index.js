"use strict";

const ComponentTemplate = require('./lib/template.js');
const ComponentPackage = require('./lib/package.js');

function run() {
	const componentTemplate = new ComponentTemplate(__dirname);
	const componentPackage = new ComponentPackage('.', componentTemplate.read());
	
	componentPackage.create();
}

run();