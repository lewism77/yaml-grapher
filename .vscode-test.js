const { defineConfig } = require('@vscode/test-cli');

module.exports = defineConfig({
	files: 'test/**/*.test.js',
	mocha: {
		ui: "bdd",
		color: true,
		timeout: 20000,
	  },
});
