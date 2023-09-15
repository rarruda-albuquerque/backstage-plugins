# ConvisoAppSec scalffolder actions

This is [Backstage](https://backstage.io/) scaffolder [custom action](https://backstage.io/docs/features/software-templates/writing-custom-actions) with a sample [software template](https://backstage.io/docs/features/software-templates/) for [ConvisoAppSec](https://www.convisoappsec.com/).

ConvisoAppSec is an ASPM (Application Security Posture Management) used on software development process in order to identify, correlate, and prioritize security vulnerabilities.

This module create an Backstage custom action to integrate with Conviso Graphl backend using information filled on software template form (see [Template example](#template-example))

For further details about ConvisoAppSec concepts, please follow [documentation](https://docs.convisoappsec.com/)

## Prerequisites

- A [Backstage](https://backstage.io/docs/getting-started/) project
- A [ConvisoAppSec](https://www.convisoappsec.com/) account.
- Configure access to Conviso API Graphl. See the [Conviso API GraphQL documentation](https://docs.convisoappsec.com/api/graphql/introduction) to learn how to do that

## Installation

Run the command below from your Backstage root directory

```sh
yarn add --cwd packages/backend @backstage/integration @raalbuquerque/backstage-plugin-scaffolder-backend-module-convisoappsec
```

## Configuration

1. Register ConvisoAppSec actions on Backstage backend, modifying the `packages/backend/src/plugins/scaffolder.ts`

```ts
/* highlight-add-start */
import {
  createRouter,
  createBuiltinActions,
} from '@backstage/plugin-scaffolder-backend';
import { ScmIntegrations } from '@backstage/integration';
import { createAppSecFlowProject } from '@raalbuquerque/backstage-plugin-scaffolder-backend-module-convisoappsec';
/* highlight-add-end */

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  // ...

  /* highlight-add-start */
  const integrations = ScmIntegrations.fromConfig(env.config);

  const builtInActions = createBuiltinActions({
    integrations,
    catalogClient,
    config: env.config,
    reader: env.reader,
  });
  /* highlight-add-end */

  /* highlight-add-next-line */
  const actions = [
    ...builtInActions,
    createAppSecFlowProject({ config: env.config }),
  ];

  return await createRouter({
    logger: env.logger,
    config: env.config,
    database: env.database,
    reader: env.reader,
    catalogClient,
    identity: env.identity,
    /* highlight-add-next-line */
    actions,
  });
}
```

For more informations about plugin registration, please check [Backstage documentation](https://backstage.io/docs/features/software-templates/writing-custom-actions#registering-custom-actions)

2. Add ConvisoAppSec parameters to `app-config-yaml`, at same level to `scaffolder` property, for instance.

   ```yaml
   # app-config.yaml
   /* highlight-add-start */
   conviso:
      baseUrl: ${APPSECFLOW_BASE_URL}
      x-api-key: ${APPSECFLOW_API_KEY}
      companyId: ${APPSECFLOW_COMPANY_ID}
   /* highlight-add-end */
   ```

   > **Warning**
   >
   > You should ommit `/graphql` path on `baseUrl` parameter

   _*Note*_:

## Action input and output

Once the configuration is done, all the input and output parameters can be seen reaching `/create/actions` route in your Backstage installation.

## Template example

Finished module configuration steps, the software template can be loaded on software catalog enabling Backstage users creating their ConvisoAppSec projects

```yaml
# template.yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: convisoappsec:project:create
  title: Create a ConvisoAppSec project
  description: Creates a new ConvisoAppSec project and register component on software catalog
  tags:
    - conviso
    - convisoappsec
    - security
  links:
    - title: ConvisoAppSec Documentation
      url: https://docs.convisoappsec.com/
spec:
  owner: raalbuquerque
  type: service

  parameters:
    - title: Project information
      required:
        - label
        - goal
        - scope
        - typeId
        - estimatedStartDate
      properties:
        label:
          title: Project Label
          type: string
          description: Name of the project
          pattern: '^([a-zA-Z][a-zA-Z0-9]*)(-[a-zA-Z0-9]+)*$'
          ui:autofocus: true
        goal:
          title: Goal
          type: string
          description: Goal
        scope:
          title: Scope
          type: string
          description: Scope
        typeId:
          title: Type
          type: number
          description: Select the project type from list
          enum:
            - 1
            - 2
            - 3
            - 4
            - 5
            - 6
            - 7
            - 8
            - 9
            - 10
            - 11
            - 12
            - 13
            - 14
            - 15
            - 16
          enumNames:
            - penetration_test
            - code_review
            - vulnerability_assessment
            - wordpress_plugin_assessment
            - accuracy
            - internal
            - web_application_firewall
            - threat_modeling
            - security_requirements
            - consulting
            - sensei
            - armature
            - network_penetration_testing
            - web_penetration_testing
            - mobile_penetration_testing
            - reverse_engineer
        estimatedStartDate:
          title: Start Date
          type: string
          format: date
          description: Estimated date when analysis will start
          hint: Not before today
          ui:widget: date
          ui:options:
            yearsRange: ['2020', '2023']
  steps:
    - id: createConvisoAppSecProject
      name: Create AppSecFlow project
      action: convisoappsec:project:create
      input:
        label: ${{ parameters.label }}
        goal: ${{ parameters.goal }}
        scope: ${{ parameters.scope }}
        typeId: ${{ parameters.typeId }}
        estimatedStartDate: ${{ parameters.estimatedStartDate }}
        tags: ${{ parameters.tags }}
  output:
    links:
      - title: Project URL
        url: ${{ steps['createConvisoAppSecProject'].output.projectUrl }}
    text:
      - title: More information
        content: |
          **Entity URL:** ${{ steps['createConvisoAppSecProject'].output.projectPid }}
```

> **Note**
>
> The software template above just create a project on ConvisoAppSec platform.
> In order to create software repositories and register new entities on Backstage software catalog you should combine with others [software templates actions](https://backstage.io/docs/features/software-templates/writing-templates)
