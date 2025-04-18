# Discloud Deploy Action

[![Build](https://github.com/discloud/deploy-action/actions/workflows/build.yml/badge.svg)](https://github.com/discloud/deploy-action/actions/workflows/build.yml)

This action deploys your application to [Discloud](https://discloud.com)

## Useful links

- [Discloud](https://discloud.com)
- [Discloud documentation](https://docs.discloud.com)

[![Discord](https://discord.com/api/guilds/584490943034425391/widget.png?style=banner2)](https://discord.gg/discloud)

## Inputs

| Property | Description | Required | Default |
| :- | :-: | :-: | :-: |
| token | Your account Discloud token | ☑️ | |
| app_id | Your app ID in Discloud **\*** | | |
| glob | Use the [`glob`][glob] pattern to specify files to upload ** | | `**` |
| team | Specify if the app is a `team` app. Ignore if the app is yours | | `false` |

> **\*** `app_id` can be ignored if the [`discloud.config`](./discloud.config) file with the `ID` property exists in your repository  
**\*\*** `glob` can be a list of glob patterns, see [example](#list-of-glob-patterns-example)

## Example usage

```yml
name: Discloud Deploy Action

on:
  release:
    types: [created] # On release created
  workflow_dispatch: # Manual running

permissions:
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4 # Required to use the file system
      - uses: discloud/deploy-action@v1
        with:
          token: ${{ secrets.DISCLOUD_TOKEN }} # Required
          # app_id: "ID"
          # glob: ** # All files
          # team: true
```

## Using config

You can use `discloud.config` file to specify `app_id`

See [example](./discloud.config)

## Ignoring files

You can use the `.discloudignore` file to ignore files during deploy

See [example](./.discloudignore)

## Using glob property

You can use the [`glob`][glob] property to specify which files to upload

### List of glob patterns example

```yml
glob: |
  **
  pathToFile
  pathToDirectory/**
```

[glob]: https://github.com/isaacs/node-glob
