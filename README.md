# FluentUI Component Scaffolding

This is a nodejs application to generate the basic structure of a React component built using the [FluentUI](https://github.com/microsoft/fluentui) library, including the scripts and configuration requried for publishing it to the `npm` package repository.
This tool uses a built-in template directory, collects some additional data, such as package name, library name, package author and creates:

- the basic directory structure;
- build scripts, `package.json`, webpack configuration files, license file and a standard `.gitignore`;
- empty component file;
- empty stylesheet files;
- basic structure of a demo application to feature the component.

It also runs `npm install` after the package structure has been created.

## Installing

`npm install --g lvd-fluentui-component-scaffolding`

## Usage

Navigate to the root directory where your component will be created and run:

`npm exec create-fluentui-component`

You will then be prompted for additional information, which is further detailed below.

## Required user input

The following parameters are collected from user input:

| Parameter | Description | Mandatory | Default |
| --- | --- | --- | --- |
| `Package name` | The name of the package. The name used in `package.json` is obtained from this value, converted to lower case  | `Y` | - |
| `Package description` | The description of the package  | `N` | - |
| `Package author` | The author of the package  | `N` | - |
| `Libary name` | The name of the root component; also the name used for the library configuratin in the webpack config file. | `N` | The part of the package name followning the last dash. |
| `Library name, dashed form` | The name of the root component in dashed form. | `N` | Derived from the library name. |

## Output structure

### The directory structure

The following directory structure is generated:

| Directory | Description |
| --- | --- |
| `demo` | Demo application root directory |
| `demo/build/app` | Demo application build output directory |
| `dist` | Component library build output |
| `docs` | Documentation files |
| `src` | Root directory for all component library source files |
| `src/assets` | Assets directory (eg. image files) |
| `src/components` | Component javascript source code |
| `src/css` | Root directory for all stylesheet files |
| `src/css/components` | Component-related stylesheet files  |
| `src/docs` | Documentation source files |

### Support files

The following support files are generated (configuration files, build scripts, license):

| File | Description |
| --- | --- |
| `LICENSE` | License file - BSD 3-clause by default |
| `.gitignore` | The git-ignore file, which, by default, contains entries for `node_modules` directory and `*.tgz` files |
| `package.json` | The `package.json` file, with [a bunch of stuff already added to it](https://github.com/alexboia/LVD-FluentUi-Component-Scaffolding/blob/main/template/package.json), including standard dependencies and dev-dependencies. |
| `README.md` | The readme file file, with the package title and package description added to it. |
| `webpack-app.config.js` | [webpack configuration file for building the demo application](https://github.com/alexboia/LVD-FluentUi-Component-Scaffolding/blob/main/template/webpack-app.config.js) |
| `webpack-dist.config.js` | [webpack configuration file for building the library itself for distribution via npm packaging](https://github.com/alexboia/LVD-FluentUi-Component-Scaffolding/blob/main/template/webpack-dist.config.js) |
| `build-all.ps1` | PowerShell script for building the demo app and the library itself in one sitting |
| `build-app.ps1` | PowerShell script for building the demo app |
| `build-dist.ps1` | PowerShell script for building the library itself |

### Component files

The following javascript files are generated for the library-related component:

| File | Description |
| --- | --- |
| `src/components/${LibraryName}.jsx` | [The main component file](https://github.com/alexboia/LVD-FluentUi-Component-Scaffolding/blob/main/template/src/components/%24%7BLibraryName%7D.jsx), that contains an empty component class definition. The `${LbraryName}` placeholder is replaced with the value collected (or derived) from user input. |
| `src/components/Index.js` | The root export file that will be used as an entry point when building the library itself. |

The following javascript files are generated for the demo application-related components:

| File | Description |
| --- | --- |
| `src/App.jsx` | The actual demo [application main component](https://github.com/alexboia/LVD-FluentUi-Component-Scaffolding/blob/main/template/src/App.jsx) |
| `src/Root.jsx` | Sets up the root component structure, including the stuff required for FluentUI apps |
| `src/Index.jsx` | Sets up the who react application lifecycle |

### Stylesheet files

The following stylesheet files are generated for the library-related component:

| File | Description |
| --- | --- |
| `src/css/components/${LibraryNameDashed}.css` | The main component stylesheet file. The `${LibraryNameDashed}.css` placeholder is replaced with the value collected (or derived) from user input. |
| `src/css/components/index.css` | The root file that will be used as a stylesheet entry point when building the library itself. |

The following stylesheet files are generated for the demo application:

| File | Description |
| --- | --- |
| `src/css/style.css` | The maine demo app stylesheet file. Contains [some standard includes, as well as basic rules](https://github.com/alexboia/LVD-FluentUi-Component-Scaffolding/blob/main/template/src/css/style.css). |

### Demo application

The following files are generated in order to run the built demo application:

| File | Description |
| --- | --- |
| `demo/index.html` | The html entry point for the demo application. Either run it directly or deploy it somewhere. |

## Supported placeholders

The following placeholders are supported for usage both in file names, as well as file contents:

| Placeholder | Value |
| --- | --- |
| `${LibraryName}` | `Library name` |
| `${LibraryNameDashed}` | `Library name, dashed form` |
| `${PackageName}` | `Package name` |
| `${PackageNameLower}` | `Package name`, converted to lower case |
| `${PackageDescription}` | `Package description` |
| `${PackageAuthor}` | `Package author` |
| `${CurrentYear}` | `new Date().getFullYear()` |

## Notes

1. To avoid having `npm pack` strip the empty directories, a `.dummy` file is included in each template directory. This does not find its way in the final component package directory.
2. To avoid having `npm pack` rename the `.gitignore` file in the template directory to `.npmignore`, the file is included using the `.ignore` name and renamed when when creating the final component package directory.

## Donate

I put some of my free time into developing and maintaining this plugin.
If helped you in your projects and you are happy with it, you can...

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Q5Q01KGLM)