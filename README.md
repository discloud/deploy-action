# Discloud Deploy Action

This action deploys your application to Discloud

## Inputs

### `token`

- **Required** Your Discloud token.

### `app_id`

- Your app ID in Discloud.

- You can ignore it if the `discloud.config` file with the `ID` property exists in your repository.

### `team`

- Specify if the app is a `team` app. Ignore if the app is yours.

## Example usage

```yml
name: Discloud Deploy Action

on:
  release:
    types: [created]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: discloud/deploy-action@v1
        with:
          token: ${{ secrets.DISCLOUD_TOKEN }}
          # appId: "ID"
          # team: true
```

## Using config

You can use `discloud.config` file to specify `app_id`

See [example](./discloud.config)

## Ignoring files

You can use the `.discloudignore` file to ignore files during deploy

See [example](./.discloudignore)
