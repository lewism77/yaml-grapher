# yaml-grapher README

If you have several YAML or YML files linked together for the purpose of ADO pipelines or GH actions, it's easy to get lost in the myriad of template references. This extension produces a graph of references using MermaidJS to help come to terms with the mess.

## Features

Selecting a start file, it will graph out the references.
Can show:
- Conditions of a link
- Multiple links from one file to another (if links have different conditions)
- Multi parent links

Other notes:
- Root only needs to be a text file with YAML structured text, not necessarily with a yaml extension
- Any yaml structured file is fine for linked files, extension doesn't matter
- Linked files don't need to exist to appear in the graph

## Extension Settings

This extension contributes the following settings:

* `yaml-grapher.orientation`: Choose whether the graph is displayed top-down, bottom-up, left-right or right-left
* `myExtension.thing`: Set to `blah` to do something.

## Known Issues

* Single line template references (i.e. with no parameters) do not yet appear in the graph

## Release Notes

### 1.0.0

Initial release of yaml-grapher
- Recursive links to sub files from a given root
- Display conditions on links
