const fs = require('fs');
const yaml = require('yaml');
const path = require('path');


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

                    // Iterate through inner steps if they exist and are an array
                    if (Array.isArray(innerSteps)) {
                        innerSteps.forEach(innerStep => processTemplateStep(innerStep, condition));
                    }
                } else if (key === 'template' && typeof obj[key] === 'string') {
                    // Handle single-line template: 'template: somefile.yml' 
                    processTemplateStep(obj, null); // Pass null condition for direct templates
                } else {
                    // Recursively check nested objects
                    findTemplates(obj[key]);
                }
            });
        }

        // Helper function to process individual template steps
        function processTemplateStep(step, condition) {
            if (step.template) {
                let templatePath = step.template;
                if (templatePath.indexOf(".") == -1 && !templatePath.endsWith('.yml') && !templatePath.endsWith('.yaml')) {
                    // Assume it's a YAML file if extension is missing since it's being referenced like one
                    templatePath += '.yaml';
                }

                const templateFilePath = path.resolve(path.dirname(filePath), templatePath);
                const existingTarget = nodes.find(node => node.filePath === templateFilePath);

                let id = nextId;
                if (existingTarget) {
                    id = existingTarget.id;
                } else {
                    nextId++;
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
        }
    }


    findTemplates(yamlContent);
    return { nodes, links };
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

module.exports = { processYamlFile };