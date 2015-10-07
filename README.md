![Image of Yaktocat](http://static.wixstatic.com/media/796749_ae4d25c41ef14e6b965ba188715c366e.png_srz_p_77_86_75_22_0.50_1.20_0.00_png_srz)
# JSL [![Build Status](https://travis-ci.org/cbastos/AMD.svg?branch=master)](https://travis-ci.org/cbastos/JSL) [![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/cbastos/JSL?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
**JSL** (**J**ava**S**cript **L**oader) is back-end (nodeJS complatible) and front-end (all browsers) script loader. It allows register and retrieve scripts and modules with their dependencies.
##What's a script?
A **script** is a ".js" file that exports an object related with a named variable (the script identifier). 
The script could have dependencies of other scripts to be executed. In this case, the script register info has the detail of dependencies.
##What's a module?
A **module** is one type of entity that you can register and retrieve trough **JSL**. The module registration info has a function that retrieves the definition of the module.
##Usage examples
You can see full documentation on http://www.jsloader.com/ .
#### Registering an retrieving scripts
1. Register a new element in JSLoader:
```javascript
	JSL.set({ id: "SomeIdentifierThatExportsTheFile", from : "/path/to/file.js" });
```
2. Retrieve the registered element:
```javascript
	JSL.get({ id: "SomeIdentifierThatExportsTheFile" }).then(function(exportedElement){
		exportedElement.doSomething();
	});
```
#### Registering an retrieving modules
1. Registering a module in JSLoader:

```javascript
	JSL.set({ 
		id: "SomeModule",
		from : function(){
			return {
				someMethod: function(){ } 
			};
		}
	});
```

2. Retrieve the registered module:
```javascript
	JSL.get({ id: "SomeModule" }).then(function(SomeModule){
		SomeModule.someMethod();
	});
```