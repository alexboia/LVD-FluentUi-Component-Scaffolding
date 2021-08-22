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
const utils = require('./utils');
const GitEngine = require("./git-engine");
const PackageBuildContext = require("./package-build-context");
const PackageBuilderLogger = require("./package-builder-logger");

const CallbackStep = require("./build-steps/callback");
const ConsoleReadPackageModelStep = require("./build-steps/console-read");
const CreateComponentPackageStep = require("./build-steps/create-component-package");
const GitCloneStep = require("./build-steps/git-clone");
const InstallComponentDepsStep = require("./build-steps/install-component-deps");
const JsonManifestReadPackageModelStep = require("./build-steps/json-manifest-read");
const GitCommitStep = require("./build-steps/git-commit");
const GitPushStep = require("./build-steps/git-push");

const BuildStatus = require('./build-status');

const SetActualDestinationPathStepName = 'Determine actual destination path';
const InitializeGitEngineStepName = 'Initialize git engine';

class PackageBuildStepProvider {
	constructor(context, logger) {
		/** @type PackageBuildContext */
		this._context = context;
		/** @type PackageBuilderLogger */
		this._logger = logger;
	}

	createSteps() {
		const steps = [];

		steps.push(this._createTemplateReadStep());
		steps.push(this._createSetActualDestinationPathStep());

		if (this._needsGitEngine()) {
			steps.push(this._createInitializeGitEngineStep());
		}

		if (this._shouldGitClone()) {
			steps.push(this._createGitCloneStep());
		}

		steps.push(this._createCreateComponentPackageStep());

		if (this._shouldGitCommit() || this._shouldGitPush()) {
			steps.push(this._createGitCommitStep());
		}

		if (this._shouldGitPush()) {
			steps.push(this._createGitPushStep());
		}

		if (!this._skipInstallingDependencies()) {
			steps.push(this._createInstallComponentDepsStep());
		}

		return steps;
	}

	_createTemplateReadStep() {
		if (this._shouldReadPackageModelFromManifest()) {
			return () => new JsonManifestReadPackageModelStep(this._context, this._logger);
		} else {
			return () => new ConsoleReadPackageModelStep(this._context, this._logger);
		}
	}

	_shouldReadPackageModelFromManifest() {
		return this._context.shouldReadPackageModelFromManifest();
	}

	_createSetActualDestinationPathStep() {
		return () => new CallbackStep(
			() => this._executeSetActualDestinationPathStep(), 
			SetActualDestinationPathStepName, 
			this._context, 
			this._logger
		);
	}

	_executeSetActualDestinationPathStep() {
		const actualDestinationPath = this._determineActualDestinationPath();
		this._ensureActualDestinationPathExists(actualDestinationPath);
		this._context.setActualDestinationPath(actualDestinationPath);
		return BuildStatus.Successful;
	}

	_determineActualDestinationPath() {
		const packageModelData = this._context.getPackageModelData();
		const baseDestinationPath = this._context.getBaseDestinationPath();
		
		const actualDestinationPath = this._context.shouldCreateRoot() 
			? path.join(baseDestinationPath, packageModelData.packageNameLower)
			: baseDestinationPath;

		return actualDestinationPath;
	}

	_ensureActualDestinationPathExists(actualDestinationPath) {
		utils.ensureDirectoryExists(actualDestinationPath);
	}

	_needsGitEngine() {
		return this._context.shouldGitClone()
			|| this._context.shouldGitCommit()
			|| this._context.shouldGitPush();
	}

	_createInitializeGitEngineStep() {
		return () => new CallbackStep(
			() => this._executeInitializeGitEngineStep(), 
			InitializeGitEngineStepName, 
			this._context, 
			this._logger
		);
	}

	_executeInitializeGitEngineStep() {
		this._context.setGitEngine(this._createGitEngine());
		return BuildStatus.Successful;
	}

	_createGitEngine() {
		const gitConfig = {
			name: this._context.getGitName(),
			email: this._context.getGitEmail(),
			username: this._context.getGitUsername(),
			token: this._context.getGitToken()
		};

		const gitEngine = new GitEngine(
			this._context.getActualDestinationPath(), 
			gitConfig,
			this._logger
		);

		return gitEngine;
	}

	_shouldGitClone() {
		return this._context.shouldGitClone();
	}

	_createGitCloneStep() {
		return () => new GitCloneStep(
			this._context, 
			this._logger
		);
	}

	_shouldGitCommit() {
		return this._context.shouldGitCommit();
	}

	_createGitCommitStep() {
		return () => new GitCommitStep(this._context, this._logger);
	}

	_shouldGitPush() {
		return this._context.shouldGitPush();
	}

	_createGitPushStep() {
		return () => new GitPushStep(this._context, this._logger);
	}

	_createCreateComponentPackageStep() {
		return () => new CreateComponentPackageStep(this._context, this._logger);
	}

	_skipInstallingDependencies() {
		return this._context.skipInstallingDependencies();
	}

	_createInstallComponentDepsStep() {
		return () => new InstallComponentDepsStep(this._context, this._logger);
	}
}

module.exports = PackageBuildStepProvider;