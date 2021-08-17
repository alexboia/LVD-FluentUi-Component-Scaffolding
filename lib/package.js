const fs = require('fs');
const path = require('path');
const readline = require("readline");
const utils = require('./utils.js');
const lodash = require('lodash');
const { exec } = require("child_process");

class ComponentPackage {
	constructor(destinationPath, template) {
		if (!destinationPath) {
			throw new Error('Destination path is required, but not provided.');
		}
		
		if (!template || !template.length) {
			throw new Error('Template is required, but not provided.');
		}

		this.template = template;
		this.destinationPath = path.normalize(destinationPath);

		this.templatePlacholders = {
			libraryName: '${LibraryName}',
			libraryNameDashed: '${LibraryNameDashed}',
			packageName: '${PackageName}',
			packageNameLower: '${PackageNameLower}',
			packageDescription: '${PackageDescription}',
			packageAuthor: '${PackageAuthor}'
		};

		this.packageModel = {
			libraryName: null,
			libraryNameDashed: null,
			packageName: null,
			packageNameLower: null,
			packageDescription: null,
			packageAuthor: null
		};

		this.input = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});
	};

	create() {
		const me = this;
		me._readPackageModel(function() {
			if (me._hasFilledInPackageModel()) {
				me._createPackage();
			}
		});
	}

	_readPackageModel(onReady) {
		const me = this;
		const input = me.input;
		const packageModel = me.packageModel;

		input.on('close', function() {
			onReady();
		});
	
		input.question('Package name = ', function(packageName) {
			if (!packageName) {
				console.error('Package name cannot be empty!');
				input.close();
				return;
			}

			packageModel.packageName = packageName;
			packageModel.packageNameLower = packageName.toLowerCase();

			input.question('Package description = ', function(packageDescription) {
				packageModel.packageDescription = packageDescription;
				
				input.question('Package author = ', function(packageAuthor) {
					packageModel.packageAuthor = packageAuthor;
					
					input.question('Libary name = ', function(libraryName) {
						packageModel.libraryName = libraryName 
							|| utils.extractDefaultLibraryName(packageModel.packageName);

						input.question('Library name, dashed form = ', function(libraryNameDashed) {
							packageModel.libraryNameDashed = libraryNameDashed 
								|| utils.extractDefaultDashedLibraryName(packageModel.libraryName);
							input.close();
						});
					});
				});
			});
		});
	}

	_hasFilledInPackageModel() {
		return !!this.packageModel.packageName;
	}

	_createPackage() {
		const packageContents = this._processTemplate(this.template);
		const destinationPath = this._determineDestinationPath();

		this._ensureDestinationPathExists(destinationPath);
		this._writePackageContents(packageContents, destinationPath);
		this._installPackageDependencies(destinationPath);
	}

	_processTemplate(template) {
		const me = this;
		const packageContents = [];
	
		template.forEach(function(templateItem) {
			const packageItem = lodash.cloneDeep(templateItem);
			if (me._shouldIgnorePackageItem(packageItem)) {
				return;
			}
			
			packageItem.fileName = me._processFileName(packageItem.fileName);
			if (packageItem.isDirectory) {
				packageItem.items = me._processTemplate(packageItem.items);
			} else {
				packageItem.contents = me._replacePlaceholders(packageItem.contents);
			}
	
			packageContents.push(packageItem);
		});
	
		return packageContents;
	}

	_determineDestinationPath() {
		return path.join(this.destinationPath, this.packageModel.packageNameLower);
	}

	_shouldIgnorePackageItem(packageItem) {
		return utils.isDummyFile(packageItem.fileName);
	}

	_processFileName(fileName) {
		let finalFileName = fileName;
		if (utils.isGitIgnoreSurogateFile(finalFileName)) {
			finalFileName = utils.convertToRegularGitIgnoreFileName(finalFileName);
		} else if (utils.isTemplateFileName(finalFileName)) {
			finalFileName = this._replacePlaceholders(finalFileName);
		}
		return finalFileName;
	}

	_replacePlaceholders(source) {
		let result = source;
		const templatePlacholders = this.templatePlacholders;
		const packageModel = this.packageModel;
	
		for (const placeholderKey in templatePlacholders) {
			if (templatePlacholders.hasOwnProperty(placeholderKey)) {
				const placholder = templatePlacholders[placeholderKey];
				const bindValue = packageModel[placeholderKey];

				result = result.replaceAll(placholder, 
					bindValue);
			}
		}
	
		return result;
	}

	_ensureDestinationPathExists(destinationPath) {
		utils.ensureDirectoryExists(destinationPath);
	}

	_writePackageContents(packageContents, destinationPath) {
		const me = this;
		packageContents.forEach(function(packageItem) {
			const itemPath = path.join(destinationPath, 
				packageItem.fileName);
	
			me._preparePackageItem(packageItem, 
				itemPath);
	
			me._writePackageItemContents(packageItem, 
				itemPath);
		});
	}
	
	_preparePackageItem(packageItem, itemPath) {
		if (!fs.existsSync(itemPath) && packageItem.isDirectory) {
			fs.mkdirSync(itemPath, {
				recursive: true
			});
		}
	}
	
	_writePackageItemContents(packageItem, itemPath) {
		if (packageItem.isDirectory) {
			this._writePackageContents(packageItem.items, 
				itemPath);
		} else {
			fs.writeFileSync(itemPath, packageItem.contents, {
				encoding: 'utf-8'
			});
		}
	}

	_installPackageDependencies(destinationPath) {
		const returnToDir = process.cwd();
		process.chdir(destinationPath);
		exec('npm install', function(error, stdout, stderr) {
			if (error) {
				console.error(error.message);
				process.chdir(returnToDir);
				return;
			}

			if (stderr) {
				console.warn(stderr);
				process.chdir(returnToDir);
				return;
			}
	
			process.chdir(returnToDir);
		});
	}
}

module.exports = ComponentPackage;