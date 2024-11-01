const sinon = require('sinon');
const vscode = require('vscode');
const path = require('path');
const { generateHtml } = require('../../src/generateHtml'); // Adjust the path accordingly

let expect;

describe("generateHtml", () => {
    let webviewMock;
    let contextMock;
    let webviewUriStub;

    before(async () => {
        const chai = await import('chai');
        expect = chai.expect;
    });

    beforeEach(() => {
        // Mock the webview and context objects
        webviewMock = {
            asWebviewUri: sinon.stub()
        };
        
        contextMock = {
            extensionPath: '/fake/path/to/extension'
        };

        // Stub the webview URI generation
        webviewUriStub = vscode.Uri.file(path.join(contextMock.extensionPath, 'media', 'mermaid.min.js'));
        webviewMock.asWebviewUri.withArgs(webviewUriStub).returns('vscode-resource://mermaid.min.js');
    });

    it("should generate correct html with mermaid string format", () => {
        const mermaidContent = 'flowchart TD; A-->B;';
        const html = generateHtml(webviewMock, contextMock, mermaidContent);

        // Check if the HTML includes the expected content
        expect(html).to.include('<html lang="en">');
        expect(html).to.include('<meta charset="UTF-8">');
        expect(html).to.include('<title>YAML Graph</title>');
        expect(html).to.include('<script type="text/javascript" src="vscode-resource://mermaid.min.js" />');
        expect(html).to.include('<div class="mermaid">');
        expect(html).to.include(mermaidContent);

        // Verify if CSP includes the expected `script-src` setting
        expect(html).to.match(/<meta http-equiv="Content-Security-Policy" content="default-src 'none' 'unsafe-inline'; script-src/);
    });

    it("should correctly initialize mermaid on load", () => {
        const mermaidContent = 'flowchart TD; A-->B;';
        const html = generateHtml(webviewMock, contextMock, mermaidContent);

        // Check for mermaid initialization script
        expect(html).to.include('mermaid.initialize({ startOnLoad: true });');
    });
});
