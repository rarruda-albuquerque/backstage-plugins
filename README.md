# Backstage Plugins

This repository contains plugins created over a vanilla Backstage installation.

## Available plugins

### Scaffolder plugin to create a ConvisoAppSec project

> **Note**
>
> ConvisoAppSec is an ASPM (Application Security Posture Management) used on software development process in order to identify, correlate, and prioritize security vulnerabilities.
>
> For further details, visit [ConvisoAppSec](https://www.convisoappsec.com/) website

This scaffolder plugin provides an integration with ConvisoAppSec API in order to create a project with information from template form.

Installation instructions can be found here: [ConvisoAppSec scalffolder actions](https://www.npmjs.com/package/@raalbuquerque/backstage-plugin-scaffolder-backend-module-convisoappsec)

Plugin source code is available [here](https://github.com/rarruda-albuquerque/backstage-plugins/tree/main/plugins/scaffolder-backend-module-convisoappsec)

## Try out and discover plugins implementation details

In order to evaluate plugins sources and check how they work you can clone this repository on your machine follow the instructions above.

```bash
git clone https://github.com/rarruda-albuquerque/backstage-plugins.git
```

Install Backstage dependencies

```bash
yarn install
```

Plugins are located on `plugins` folder under the workspace root. Each plugin has it own configuration instructions on `README` file.

```bash
cd backstage-plugins
cd plugins
```

Back to the root folder, start Backstage

```bash
yarn dev
```

## Further details about Backstage plugins

For more information about the plugin ecosystem, follow documentation:

> <https://backstage.io/docs/plugins/>

To check other opensource plugins, visit the **Plugin Marketplace**:

> <https://backstage.io/plugins>
