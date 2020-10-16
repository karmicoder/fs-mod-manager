# fs-mod-manager

A simple app for managing community content in Microsoft Flight Simulator (2020.) This project is pre-alpha and does not have an automatic installer yet. It is recommended only for those familiar with node development at this point.

## Features

- List all packages, official and community
- Manage community packages
  - Check for updates (see supported update types)
  - Backup
  - Deactivate
- Install packages from archive file (zip, rar, gz, 7z)
- Supports automated package updates via:
  - Github
    - By release tag
    - By latest commit on branch

## Planned Features

- Fully automatic updates
- More automated update sources
- App installer with automatic updates
- UI for configuring automated updates

## Project setup

Prerequisites: Windows 10, [NodeJS](https://nodejs.org/en/download/), [yarn](https://yarnpkg.com/), [Git](https://git-scm.com/download/win)

[VSCode](https://code.visualstudio.com/) (recommended): a workspace with recommeneded plugins is available in source. Any editor should work though.

All other requirements may be installed via `yarn install`

Development mode with hot-reloads via `yarn start`

Compile an .exe with `yarn build`
