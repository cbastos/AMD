![Image of Yaktocat](http://static.wixstatic.com/media/796749_ae4d25c41ef14e6b965ba188715c366e.png_srz_p_77_86_75_22_0.50_1.20_0.00_png_srz)
# JSL(**J**ava**S**cript **L**oader) [![Build Status](https://travis-ci.org/cbastos/AMD.svg?branch=master)](https://travis-ci.org/cbastos/JSL) [![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/cbastos/JSL?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
**JSL** JSL is back-end (NodeJS compatible) and front-end (all browsers) script file and module loader. It allows register and retrieve scripts and modules with their dependencies.
###What's a script?
A **script** is a ".js" file that exports an object related with a named variable (the script identifier). 
The script could have dependencies of other scripts to be executed. In this case, the script register info has the detail of dependencies.
###What's a module?
A **module** is one type of entity that you can register and retrieve trough **JSL**. The module registration info has a function that retrieves the definition of the module.
#Usage examples
You can see full documentation (api and tutorials) on http://www.jsloader.org/.

##JSL.set ( { id, from, [dependencies] } )
The "set" method allows to register scripts and modules in JSL. A module can be registered directly (with a "from" function to retrieve his definition) or trough his path (with a "from" with the script path reference as object).
##### Registering a script
```javascript
	JSL.set({ 
		id: "SomeIdentifierThatExportsTheFile", 
		from : "/path/to/file.js" 
	});
```
##### Registering a script with dependencies
```javascript
	JSL.set({ 
		id: "AnotherIdentifierThatExportsAnotherFile", 
		dependencies: "dependencyIdentifier", 
		from : "/path/to/another/file.js" 
	});
```
##### Registering a module
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
##### Registering a module with dependencies

```javascript
	JSL.set({ 
		id: "SomeModuleWithDepencies",
		dependencies: { $ : "$" }, //-> jQuery dependency
		from : function(dependencies){
			return {
				getInputValue: function(){ 
					return dependencies.$("#someInput").val();
				} 
			};
		}
	});
```

##JSL.get ( { id } )
The "get" method allows to retrieve scripts and modules previously registered in JSL.
##### Retrieving a script
```javascript
	JSL.get({ id: "SomeIdentifierThatExportsTheFile" }).then(function(exportedElement){
		exportedElement.doSomething();
	});
```
##### Retrieving a module

* Retrieve the registered module:
```javascript
	JSL.get({ id: "SomeModule" }).then(function(SomeModule){
		SomeModule.someMethod();
	});
```

##JSL.config ( { [pathResolver] , [dependencies] } )
The "config" method allows to do configurations (like configure a new path resolver or the default dependencies for all modules) over JSL.
##### Configuring the script path resolver
```javascript
	JSL.config({ 
		pathResolver: function(pathReference){
			return pathReference.from;
		}
	});
```
##### Configuring the default dependencies for all modules
```javascript
	JSL.config({ 
		dependencies: { $ : $ }
	});
```