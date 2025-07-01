# Discloud Deploy Action

[![Build][actionBuildImage]][actionBuildFile]

This action deploys your application to [Discloud][discloud]

## Useful links

- [Discloud][discloud]
- [Discloud documentation][discloudDocs]

[![Discord][discloudDiscordWidget]][discloudDiscordInvite]

## Inputs

| Property | Description | Required | Default |
| :- | :-: | :-: | :-: |
| token | Your account Discloud token | ☑️ | |
| app_id | Your app ID in Discloud **\*** | | |
| [env](#using-env-property) | Environment variables to add to zip | | |
| env_file | Env file name | | `.env` |
| [glob](#using-glob-property) | Use the [`glob`][globRepository] pattern to specify files to upload ** | | `**` |
| team | Specify if the app is a `team` app. Ignore if the app is yours | | `false` |

> **\*** `app_id` can be ignored if the [`discloud.config`](#using-config) file with the `ID` property exists in your repository  
**\*\*** `glob` can be a list of glob patterns, see [example](#list-of-glob-patterns-example)

## Example usage

```yml
name: Discloud Deploy Action

on:
  # push: # On any commit
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
          # env: ${{ secrets.ENV }}
          # env_file: .env
          # glob: ** # All files
          # team: true
```

## Using config

You can use `discloud.config` file to specify `app_id`

See [example](discloud.config)

## Ignoring files

You can use the `.discloudignore` file to ignore files during deploy

See [example](.discloudignore)

## Using glob property

You can use the [`glob`][globRepository] property to specify which files to upload

## Using env property

Set the `env` property to send environment variables in the zip file.

The `env_file` property is completely optional and the default value is `.env`.

See [creating `secrets` for a repository][githubDocsRepositorySecrets]

> ⚠️ Note that setting this property will `overwrite` the `.env` file on the host. ⚠️

### List of glob patterns example

```yml
glob: |
  **
  pathToFile
  pathToDirectory/**
```

[actionBuildFile]: https://github.com/discloud/deploy-action/actions/workflows/build.yml
[actionBuildImage]: https://github.com/discloud/deploy-action/actions/workflows/build.yml/badge.svg
[discloud]: https://discloud.com
[discloudDocs]: https://docs.discloud.com
[discloudDiscordInvite]: https://discord.gg/discloud
[discloudDiscordWidget]: https://discord.com/api/guilds/584490943034425391/widget.png?style=banner2
[githubDocsRepositorySecrets]: https://docs.github.com/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository
[globRepository]: https://github.com/isaacs/node-glob
