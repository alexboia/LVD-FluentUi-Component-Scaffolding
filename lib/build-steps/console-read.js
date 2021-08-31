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

const PackageBuildContext = require('../package-build-context.js');
const PackageBuilderLogger = require('../package-builder-logger.js');
const ComponentPackageModelConsoleReader = require('../package-model-readers/console.js');

const BuildStatus = require('../build-status.js');
const { PackageModelPrintTitle, PackageModelPrintIndent } = require('../constants/package-model-read-constants.js');
const { ConsoleFormatting } = require('../constants/console-constants.js');

const StepName = 'Read package model from console user input';

class ConsoleReadPackageModelStep {
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
		this._readPackageModel(onReady);
	}

	_readPackageModel(onReady) {
		/** @type ComponentPackageModelConsoleReader */
		const packageModelReader = this._creatPackageModelReader();
		packageModelReader.read((buildStatus, packageModelData) => {
			this._context.setPackageModelData(packageModelData);
			if (buildStatus == BuildStatus.Successful) {
				this._displayPackageModelData(packageModelData);
			}
			onReady(buildStatus);
		});
	}

	_creatPackageModelReader() {
		return new ComponentPackageModelConsoleReader(
			{ messageIndent: ConsoleFormatting.DefaultBuildStepMessageIndent },
			this._context,
			this._logger
		);
	}

	_displayPackageModelData(packageModelData) {
		packageModelData.printToConsole(
			PackageModelPrintTitle, 
			{ 
				messageIndent: PackageModelPrintIndent,
				spaceBefore: true,
				spaceAfter: true
			}
		);
	}

	get name() {
		return StepName;
	}
}

module.exports = ConsoleReadPackageModelStep;