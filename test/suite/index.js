const path = require('path');
const Mocha = require('mocha');
const { glob } = require('glob');  // Import as a Promise

async function run() {
	const mocha = new Mocha({
		ui: 'bdd',
		color: true
	});

	const testsRoot = path.resolve(__dirname, '..');

	try {
		// Await glob to get list of files
		const files = await glob('test/**/*.test.js', { cwd: testsRoot });
		console.log("Test files found:", files);  // Log files to debug

		// Check if any files were found, or it will hang
		if (files.length === 0) {
			console.warn("No test files found.");
			return;
		}

		// Add files to mocha
		files.forEach(file => mocha.addFile(path.resolve(testsRoot, file)));

		// Run mocha tests
		return await new Promise((resolve, reject) => {
			mocha.run(failures => {
				if (failures > 0) {
					reject(new Error(`${failures} tests failed.`));
				} else {
					resolve();
				}
			});
		});
	} catch (err) {
		console.error("Error running tests:", err);
		throw err;
	}
}

module.exports = {
	run
};
