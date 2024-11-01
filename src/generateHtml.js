const vscode = require('vscode');
const path = require('path');

// Create a page for the web view
function generateHtml(webview, context, mermaidContent) {
    const mermaidJsUri = webview.asWebviewUri(
        vscode.Uri.file(path.join(context.extensionPath, 'media', 'mermaid.min.js'))
    );

    const theme = vscode.workspace.getConfiguration('yaml-grapher').get('theme');

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; 
                        img-src ${webview.cspSource} data:; 
                        script-src ${webview.cspSource}; 
                        style-src ${webview.cspSource} 'unsafe-inline';
                    ">
            <title>YAML Graph</title>
            <script type="text/javascript" src="${mermaidJsUri}" />
        </head>
        <body>
            <div class="mermaid">
            %%{init: {"theme": "${theme}", "flowchart" : { "curve" : "basis" } } }%%
                ${mermaidContent}
            </div>
            <script>
                    mermaid.initialize({ startOnLoad: true });
            </script>
        </body>
        </html>
    `;
}

module.exports = { generateHtml }