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

const { exec } = require("child_process");

const PackageBuilderLogger = require("../package-builder-logger");
const PackageBuildContext = require("../package-build-context");

const BuildStatus = require('../build-status.js');
const StepName = 'Install component dependencies';

class InstallComponentDepsStep {
	constructor(context, logger) {
		this._checkContextValidOrThrow(context);
		this._checkLoggerValidOrThrow(logger);

		/** @type PackageBuildContext */
		this._context = context;
		/** @type PackageBuilderLogger */
		this._logger = logger;
	}

	_checkContextValidOrThrow(context) {
		if (!context) {
			throw new Error('Context is required, but not provided');
		}
	}

	_checkLoggerValidOrThrow(logger) {
		if (!logger) {
			throw new Error('Logger is required, but not provided.');
		}
	}

	execute(onReady) {
		this._installPackageDependencies(this._context.getActualDestinationPath(), (succes) => {
			const buildStatus = succes 
				? BuildStatus.Successful 
				: BuildStatus.Failed;

			onReady(buildStatus);
		});
	}

	_installPackageDependencies(destinationPath, onReady) {
		const returnToDir = process.cwd();
	
		this._logger.debug('Attempting to install package dependencies...');
		process.chdir(destinationPath);

		exec('npm install', {
			encoding: 'utf8',
			windowsHide: true
		}, (error, stdout, stderr) => {
			let success = false;

			if (error) {
				this._logger.error(error.message);
			} else if (stderr) {
				this._logger.warning(stderr);
				success = true;
			} else {
				success = true;
			}

			if (!!stdout) {
				this._logger.debug(stdout);
			}

			if (!success) {
				this._logger.reportProgressWarning('There was an issue while installing dependencies. Please consult the logs for more details.');
			} else {
				this._logger.debug('Successfully installed package dependencies.');
			}

			process.chdir(returnToDir);
			onReady(success);
		});
	}

	get name() {
		return StepName;
	}
}

module.exports = InstallComponentDepsStep;