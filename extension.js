const vscode = require('vscode');
const fs = require('fs');
const yaml = require('yaml');
const path = require('path');

function activate(context) {
    let disposable = vscode.commands.registerCommand('yaml-grapher.generate', async function () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active text editor!");
            return;
        }

        const document = editor.document;
        const filePath = document.uri.fsPath;

        if (!filePath.endsWith('.yml') && !filePath.endsWith('.yaml')) {
            vscode.window.showErrorMessage("Not a YAML file!");
            return;
        }

        const graphData = processYamlFile(filePath);
        const mermaidContent = generateMermaid(graphData);

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

function readYamlFile(filePath) {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        return yaml.parse(fileContent);
    } catch (err) {
        console.error(`Error reading YAML file: ${filePath}`, err);
        return null;
    }
}

// Recursive function to find template references and build the graph
function processYamlFile(filePath, processedFiles = new Set(), nodes = [], links = [], nextId = 0) {
    // Avoid infinite recursion for circular references
    // We already have the links for processed
    if (processedFiles.has(filePath)) return { nodes, links };

    const yamlContent = readYamlFile(filePath);
    if (!yamlContent) return { nodes, links };

    const fileName = path.basename(filePath);
    let currentNode = { name: fileName, filePath, id: null };

    // Add the current node if it doesn't already exist
    const existing = nodes.find(node => node.filePath === currentNode.filePath)
    if (!existing) {
        currentNode.id = nextId;
        nextId++;
        nodes.push(currentNode);
    } else {
        currentNode.id = existing.id
    }

    processedFiles.add(filePath);

    // Recurse through each 
    function findTemplates(obj) {
        if (Array.isArray(obj)) {
            // If it's an array, loop through each item
            obj.forEach(item => findTemplates(item));
        } else if (typeof obj === 'object' && obj !== null) {
            Object.keys(obj).forEach(key => {
                // Check for conditional templates
                if (key.startsWith('${{ if ')) {
                    const condition = key;  // Keep the condition key
                    const innerSteps = obj[key];  // Get the nested steps

                    // Iterate through inner steps
                    if (Array.isArray(innerSteps)) {
                        innerSteps.forEach(innerStep => {
                            if (innerStep.template) {
                                let templatePath = innerStep.template;
                                if (!templatePath.endsWith('.yml') && !templatePath.endsWith('.yaml')) {
                                    // Assume it's a YAML file if extension is missing since it's being referenced like one
                                    templatePath += '.yaml';
                                }

                                const templateFilePath = path.resolve(path.dirname(filePath), templatePath);
                                const existingTarget = nodes.find(node => node.filePath === templateFilePath)

                                let id = nextId
                                if (existingTarget) {
                                    id = existingTarget.id
                                } else {
                                    nextId++
                                }
                                const targetNode = { name: path.basename(templateFilePath), filePath: templateFilePath, id: id };

                                // Only add target node if it doesn't already exist
                                if (!nodes.find(node => node.filePath === targetNode.filePath)) {
                                    nodes.push(targetNode);
                                }

                                // Add a link with the condition
                                links.push({ source: currentNode, target: targetNode, condition });
                                
                                if (fs.existsSync(templateFilePath)) {
                                    // Recursively process the template file if it actually exists
                                    processYamlFile(templateFilePath, processedFiles, nodes, links, nextId);
                                } else {
                                    console.warn(`Template file not found: ${templateFilePath}`);
                                }
                            }
                        });
                    }
                } else {
                    // Recursively check the nested objects
                    findTemplates(obj[key]);
                }
            });
        }
    }

    findTemplates(yamlContent);
    return { nodes, links };
}

// Generate the Mermaid syntax for graph visualization
function generateMermaid({ nodes, links }) {
    let mermaid = "flowchart TD\n";

    // Add nodes
    nodes.forEach(node => {
        mermaid += `    ${node.id}["${node.name}"]\n`;
    });

    // Add links with conditions
    links.forEach(link => {
        if (link.condition) {
            const conditionLabel = link.condition.replace('${{', '').replace('}}', '').trim();
            mermaid += `    ${link.source.id} -->|"${conditionLabel}"| ${link.target.id}\n`;
        }
        else {
            mermaid += `    ${link.source.id} --> ${link.target.id}\n`;
        }
    });
    
    return mermaid;
}

// Create a page for the web view
function generateHtml(webview, context, mermaidContent) {
    const mermaidJsUri = webview.asWebviewUri(
        vscode.Uri.file(path.join(context.extensionPath, 'media', 'mermaid.min.js'))
    );

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none' 'unsafe-inline'; script-src ${webview.cspSource};">
            <title>YAML Graph</title>
            <script type="text/javascript" src="${mermaidJsUri}" />
            <script>
                document.addEventListener("DOMContentLoaded", function() {
                    mermaid.initialize({ startOnLoad: true });
                });
            </script>
        </head>
        <body>
            <div class="mermaid">
                ${mermaidContent}
            </div>
        </body>
        </html>
    `;
}

exports.activate = activate;
