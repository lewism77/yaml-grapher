# yaml-grapher README

If you have several YAML or YML files linked together for the purpose of ADO pipelines or GH actions, it's easy to get lost in the myriad of template references. This extension produces a graph of references using __MermaidJS__ to help come to terms with the mess.

To use, `Ctrl` `Shift` `P` (command palette) then call "Generate YAML Graph"

![A graph](images/screenshot.png)

## Features

Selecting a start file, it will graph out the references.
Can show:
- Conditions of a link (when using `${{ if <condition> }}` syntax)
- Multiple links from one file to another (if links have different conditions)
- Multi parent links

Other notes:
- Root only needs to be a text file with YAML structured text, not necessarily with a yaml extension
- Any yaml structured file is fine for linked files, extension doesn't matter
- Linked files don't need to exist to appear in the graph

## Extension Settings

This extension contributes the following settings:

* `yaml-grapher.orientation`: Choose whether the graph is displayed top-down, bottom-up, left-right or right-left
* `yaml-grapher.theme`: Set to a different theme; "default", "neutral", "dark", "forest"

## Known Issues

* Extension `.js` files are not bundled

## Release Notes

### 1.0.0

Initial release of yaml-grapher
* Recursive links to sub files from a given root
* Display conditions on links
