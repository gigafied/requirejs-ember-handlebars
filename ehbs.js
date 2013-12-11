define(

	[
		"module",
		"text"
	],

	function (module, text) {

		var parseConfig = function (config) {
			config.ehbs = config.ehbs || {};

			var extension = (config.ehbs.extension !== false) ? "." + (config.ehbs.extension || "hbs") : "",
				templatePath = config.ehbs.templatePath ? config.ehbs.templatePath + (config.ehbs.templatePath[config.ehbs.templatePath.length-1] === "/" ? "" : "/") : "",
				ember = config.ehbs.ember || "Ember";

			return {
				extension : extension,
				templatePath : templatePath,
				ember : ember
			};
		};

		return {

			load: function (name, req, load, config) {

				var ehbsConfig = parseConfig(config);

				if (!config.isBuild) {

					req(["text!" + ehbsConfig.templatePath + name + ehbsConfig.extension], function (val) {

						define(module.id + "!" + name, [ehbsConfig.ember], function (Ember) {
							var t = Ember.TEMPLATES[name] = Ember.Handlebars.compile(val);
							return t;
						});

						req([module.id + "!" + name], function (val) {
							load(val);
						});

					});

				}
				else {
					load("");
				}
			},

			loadFromFileSystem : function (plugin, name) {

				var ehbsConfig = parseConfig(config);

				var fs = nodeRequire('fs'),
					file = require.toUrl(ehbsConfig.templatePath + name) + ehbsConfig.extension,
					compiler = require('./ember-template-compiler.js'),
					template = compiler.precompile(fs.readFileSync(file).toString()).toString(),
					output = "define('" + plugin + "!" + name  + "', ['" + ehbsConfig.ember + "'], function (Ember) {\nvar t = Ember.TEMPLATES['" + name + "'] = Ember.Handlebars.template(" + template + ");\nreturn t;\n});\n";

				return output;
			},

			write: function (pluginName, moduleName, write, config) {
				write(this.loadFromFileSystem(pluginName, moduleName));
			}

		};
	}
);