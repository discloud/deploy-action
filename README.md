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

```yaml
name: Discloud Deploy Action
on:
  release:
    types: [created]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*

      - run: 
        uses: actions/discloud-deploy-action@latest
        with:
          token: "{{ secrets.DISCLOUD_TOKEN }}"
          # appId: "ID"
          # team: true
```
