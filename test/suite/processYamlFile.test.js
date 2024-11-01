const fs = require('fs');
const path = require('path');
const { processYamlFile } = require('../../src/processYamlFile')

let expect;
const tmpDir = path.join(__dirname, "tmp");

function writeYamlFile(filePath, content) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
}

describe("processYamlFile tests", () => {
    before(async () => {
        const chai = await import('chai');
        expect = chai.expect;
    });

    beforeEach(() => {
        // Create a temporary directory for test files
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    });

    afterEach(() => {
        // Clean up temporary files
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it("should process a file with a single template reference", () => {
        // Arrange
        const mainFile = path.join(tmpDir, "main-template.yaml");
        const childFile = path.join(tmpDir, "child-template.yaml");

        // Write main and child template files
        writeYamlFile(mainFile, `
          steps:
            - template: child-template.yaml
        `);
        writeYamlFile(childFile, `
          steps:
            - name: "Step in child template"
        `);

        const processedFiles = new Set();
        const nodes = [];
        const links = [];
        let nextId = 1;

        // Act
        processYamlFile(mainFile, processedFiles, nodes, links, nextId);

        // Assert
        expect(nodes).to.deep.include({ name: "main-template.yaml", id: 1, filePath: mainFile });
        expect(nodes).to.deep.include({ name: "child-template.yaml", id: 2, filePath: childFile });
        expect(links).to.deep.include({
            source: nodes.find(node => node.name === "main-template.yaml"),
            target: nodes.find(node => node.name === "child-template.yaml"),
            condition: null
        });
    });

    it("should process templates with conditional references", () => {
        const mainFile = path.join(tmpDir, "conditional-template.yaml");
        const prodFile = path.join(tmpDir, "prod-template.yaml");
        const stagingFile = path.join(tmpDir, "staging-template.yaml");

        writeYamlFile(mainFile, `
          steps:
            - \${{ if eq(parameters.env, "production") }}:
                - template: prod-template.yaml
            - \${{ if ne(parameters.env, "staging") }}:
                - template: staging-template.yaml
        `);
        writeYamlFile(prodFile, "steps: []");
        writeYamlFile(stagingFile, "steps: []");

        const processedFiles = new Set();
        const nodes = [];
        const links = [];
        let nextId = 1;

        // Act
        processYamlFile(mainFile, processedFiles, nodes, links, nextId);

        // Assert
        const mainNode = nodes.find(node => node.name === "conditional-template.yaml");
        const prodNode = nodes.find(node => node.name === "prod-template.yaml");
        const stagingNode = nodes.find(node => node.name === "staging-template.yaml");

        // Explicitly assert links with detailed checks for each property
        expect(links).to.satisfy((links) =>
            links.some(link => 
                link.source === mainNode &&
                link.target === prodNode &&
                link.condition === "${{ if eq(parameters.env, \"production\") }}"
            )
        );

        expect(links).to.satisfy((links) =>
            links.some(link => 
                link.source === mainNode &&
                link.target === stagingNode &&
                link.condition === "${{ if ne(parameters.env, \"staging\") }}"
            )
        );
    });

    it("should not duplicate nodes for already processed files", () => {
        const mainFile = path.join(tmpDir, "duplicate-template.yaml");
        const sharedFile = path.join(tmpDir, "shared-template.yaml");

        writeYamlFile(mainFile, `
          steps:
            - template: shared-template.yaml
            - template: shared-template.yaml
        `);
        writeYamlFile(sharedFile, "steps: []");

        const processedFiles = new Set();
        const nodes = [];
        const links = [];
        let nextId = 1;

        // Act
        processYamlFile(mainFile, processedFiles, nodes, links, nextId);

        // Assert
        expect(nodes.filter(node => node.name === "shared-template.yaml")).to.have.lengthOf(1);
    });
});