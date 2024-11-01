const vscode = require('vscode');
const path = require('path');
const { processYamlFile } = require('./processYamlFile')
const { generateMermaidFormat } = require('./generateMermaidFormat')
const { generateHtml } = require('./generateHtml')

function activate(context) {
    let disposable = vscode.commands.registerCommand('yaml-grapher.generate', async function () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active text editor!");
            return;
        }

        const document = editor.document;
        const filePath = document.uri.fsPath;

        const graphData = processYamlFile(filePath);
        const mermaidContent = generateMermaidFormat(graphData);

        const panel = vscode.window.createWebviewPanel(
            'yamlGraph',
            'YAML Template Graph',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'media'))]
            }
        );
        const htmlContent = generateHtml(panel.webview, context, mermaidContent);

        console.debug(graphData)
        console.debug(mermaidContent)

        panel.webview.html = htmlContent;
    });

    context.subscriptions.push(disposable);
}

exports.activate = activate;
