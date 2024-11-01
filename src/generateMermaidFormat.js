const vscode = require("vscode")

// Convert data to Mermaid graph format
function generateMermaidFormat({ nodes, links }) {
    const orientation = vscode.workspace.getConfiguration('yaml-grapher').get('orientation');

    let mermaid = `flowchart ${orientation}\n`;

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

module.exports = {generateMermaidFormat}