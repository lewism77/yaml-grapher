# Change Log

All notable changes to the "yaml-grapher" extension will be documented in this file.

## [Unreleased]

### Added
- Custom themes
- Reload webview automatically when settings are changed
- Supporting links based on `dependsOn` or `condition`

## [1.0.0] - 2024-11-1

### Added

- Display graph of file references
- Display conditions on links to file references in the graph
- Configuration options for graph orientation and theme

### Known issues

- Links won't generate based on `dependsOn` or `condition`
- Graph tab needs to be closed and reopened for settings changes to take effect
- Extension `.js` files are not bundled