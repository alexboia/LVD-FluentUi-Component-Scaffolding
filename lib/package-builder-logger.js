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
const winston = require('winston');

const { ConsoleColors } = require('./constants/console-constants.js');

class PackageBuilderLogger {
	constructor(logDirectory, serviceName) {
		if (!logDirectory) {
			throw new Error('Log directory is required but not specified');
		}

		this._errorLogger = this._createErrorLogger(logDirectory, 
			serviceName);
		this._activityLogger = this._createActivityLogger(logDirectory, 
			serviceName);
	}

	_createErrorLogger(logDirectoryNormalized, serviceName) {
		const errogLogPath = path.join(logDirectoryNormalized, 
			'error.log');

		return winston.createLogger({
			level: 'error',
			format: winston.format.combine(
				winston.format.errors({ stack: true }),
				winston.format.metadata(),
				winston.format.json(),
				winston.format.prettyPrint()
			),
			defaultMeta: { 
				service: serviceName 
			},
			transports: [
				new winston.transports.File({ 
					filename: errogLogPath, 
					level: 'error' 
				})
			]
		});
	}

	_createActivityLogger(logDirectoryNormalized, serviceName) {
		const activityLogPath = path.join(logDirectoryNormalized, 
			'activty.log');

		return winston.createLogger({
			level: 'debug',
			format: winston.format.combine(
				winston.format.metadata(),
				winston.format.json(),
				winston.format.prettyPrint()
			),
			defaultMeta: { 
				service: serviceName 
			},
			transports: [
				new winston.transports.File({ 
					filename: activityLogPath,
					level: 'debug' 
				})
			]
		});
	}

	reportNormalProgressStep(message) {
		console.log(`${ConsoleColors.FgGreen}${message}${ConsoleColors.FgReset}`);
		this.info(message);
	}

	reportProgressError(message, exception = null) {
		console.log(`${ConsoleColors.FgRed}${message}${ConsoleColors.FgReset}`);
		this.error(message, exception);
	}

	reportProgressWarning(message) {
		console.log(`${ConsoleColors.FgYellow}${message}${ConsoleColors.FgReset}`);
		this.warning(message);
	}

	info(message) {
		this._activityLogger.info(this._prepareForLogging(message));
	}

	_prepareForLogging(message) {
		let messageForLogging = typeof message != 'string' 
			? JSON.stringify(message) 
			: message;

		messageForLogging = messageForLogging.trim();
		return messageForLogging.replaceAll('\t', '');
	}

	debug(message) {
		this._activityLogger.debug(this._prepareForLogging(message));
	}

	warning(message) {
		this._activityLogger.warn(this._prepareForLogging(message));
	}

	error(message, exception = null) {
		this._errorLogger.error(this._prepareForLogging(message));
		if (exception != null) {
			this._errorLogger.error(winston.exceptions.getAllInfo(exception));
		}
	}
}

module.exports = PackageBuilderLogger;