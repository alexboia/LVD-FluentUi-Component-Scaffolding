// BSD 3-Clause License
// 
// LVD-FluentUi-Component-Scaffolding
// Copyright (c) 2021-2021, Alexandru Boia <alexandru.boia@gmail.com>
// All rights reserved.
// 
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
// 
// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.
// 
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
// 
// 3. Neither the name of the copyright holder nor the names of its
//    contributors may be used to endorse or promote products derived from
//    this software without specific prior written permission.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
// FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
// OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
// 

"use strict";

const path = require('path');
const GitEngine = require('./git-engine');

class PackageBuildContext {
	constructor(baseSourceDirectory, baseDestinationPath, options) {
		this._checkBaseSourceDirectoryValidOrThrow(baseSourceDirectory);
		this._checkDestinationPathValidOrThrow(baseDestinationPath);
		this._checkOptionsValidOrThrow(options);

		this._baseSourceDirectory = path.resolve(baseSourceDirectory);
		this._baseDestinationPath = path.resolve(baseDestinationPath);
		this._actualDestinationPath = null;
		this._options = options;

		this._templatePlacholders = null;
		this._packageModelData = null;
		this._template = null;
		/** @type GitEngine */
		this._gitEngine = null;
	}

	_checkBaseSourceDirectoryValidOrThrow(baseSourceDirectory) {
		if (!baseSourceDirectory) {
			throw new Error('Base source directory path is required, but not provided');
		}
	}

	_checkTemplateValidOrThrow(template) {
		if (!template || !template.length) {
			throw new Error('The template is required, but not provided.');
		}
	}

	_checkDestinationPathValidOrThrow(baseDestinationPath) {
		if (!baseDestinationPath) {
			throw new Error('Destination path is required, but not provided.');
		}
	}

	_checkOptionsValidOrThrow(options) {
		if (!options) {
			throw new Error('Options are required, but not provided');
		}
	}

	_checkLoggerValidOrThrow(logger) {
		if (!logger) {
			throw new Error('Logger is required, but not provided.');
		}
	}

	getLogDirectory() {
		return this._options.logDirectory;
	}

	shouldCreateRoot() {
		return !!this._options.shouldCreateRoot;
	}

	skipInstallingDependencies() {
		return this._options.skipInstallingDependencies;
	}

	shouldReadPackageModelFromManifest() {
		return this._options.shouldReadPackageModelFromManifest;
	}

	skipCreateVsCodeWorkspaceFile() {
		return this._options.skipCreateVsCodeWorkspaceFile;
	}

	getGitCloneRepo() {
		return this._options.gitCloneRepo;
	}

	getGitEmail() {
		return this._options.gitEmail;
	}

	getGitName() {
		return this._options.gitName;
	}

	getGitUsername() {
		return this._options.gitUsername;
	}

	getGitToken() {
		return this._options.gitToken;
	}

	shouldGitClone() {
		return !!this.getGitCloneRepo();
	}

	shouldGitCommit() {
		return this._options.shouldGitCommit;
	}

	shouldGitPush() {
		return this._options.shouldGitPush;
	}

	getBaseSourceDirectory() {
		return this._baseSourceDirectory;
	}

	getBaseDestinationPath() {
		return this._baseDestinationPath;
	}

	setActualDestinationPath(value) {
		this._actualDestinationPath = value;
	}

	getActualDestinationPath() {
		return this._actualDestinationPath;
	}

	setTemplate(value) {
		this._template = value;
	}

	getTemplate() {
		return this._template;
	}

	hasTemplate() {
		return this.getTemplate() != null;
	}

	setTemplatePlacholders(value) {
		this._templatePlacholders = value;
	}

	getTemplatePlacholders() {
		return this._templatePlacholders;
	}

	setPackageModelData(value) {
		this._packageModelData = value;
	}

	getPackageModelData() {
		return this._packageModelData;
	}

	hasPackageModelData() {
		const packageModelData = this.getPackageModelData();
		return !!packageModelData 
			&& !!packageModelData.packageName;
	}

	setGitEngine(gitEngine) {
		this._gitEngine = gitEngine;
	}

	getGitEngine() {
		return this._gitEngine;
	}
}

module.exports = PackageBuildContext;