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

							var contents = "define('" + module.id + "!" + name  +
							"', ['" + Ember + "'], function (Ember) {\nvar t = Ember.TEMPLATES['" + name + "'] = Ember.Handlebars.compile(" + val + ");\nreturn t;\n});\n";

							eval(contents);

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
					contents = fs.readFileSync(file).toString(),

					compiler = require('./ember-template-compiler.js'),
					template = fs.readFileSync(file).toString(),
					val = compiler.precompile(template).toString();

				contents = "define('" + plugin + "!" + name  +
				"', ['" + Ember + "'], function (Ember) {\nvar t = Ember.TEMPLATES['" + name + "'] = Ember.Handlebars.template(" + val + ");\nreturn t;\n});\n";

				return contents;
			},

			write: function (pluginName, moduleName, write, config) {
				write(this.loadFromFileSystem(pluginName, moduleName));
			}

		};
	}
);