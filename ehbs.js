define(

	[
		"module",
		"text"
	],

	function (module, text) {

		return {

			load: function (name, req, load, config) {

				req(['$'], function ($) {

					if (!config.isBuild) {

						var ext = (config.ehbs.extension !== false) ? "." + config.ehbs.extension || ".hbs" : "",
							Ember = config.ehbs.ember || "Ember";

						req(["text!" + name + ext], function (val) {

							var output = "define('" + module.id + "!" + name  +
							"', ['" + Ember + "'], function (Ember) {\nvar t = Ember.TEMPLATES['" + name + "'] = Ember.Handlebars.compile(" + val + ");\nreturn t;\n});\n";

							eval(output);

							req([module.id + "!" + name], function (val) {
								load(val);
							});

						});

					}
					else {
						load("");
					}
				});
			},

			loadFromFileSystem : function (plugin, name) {

				var ext = (config.ehbs.extension !== false) ? "." + config.ehbs.extension || ".hbs" : "",
					fs = nodeRequire('fs'),
					file = require.toUrl(name) + ext,
					compiler = require('./ember-template-compiler.js'),
					template = compiler.precompile(fs.readFileSync(file).toString()).toString(),
					output = "define('" + plugin + "!" + name  + "', ['" + Ember + "'], function (Ember) {\nvar t = Ember.TEMPLATES['" + name + "'] = Ember.Handlebars.template(" + template + ");\nreturn t;\n});\n";

				return output;
			},

			write: function (pluginName, moduleName, write, config) {
				write(this.loadFromFileSystem(pluginName, moduleName));
			}

		};
	}
);