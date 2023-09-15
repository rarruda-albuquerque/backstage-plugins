import { createTemplateAction } from '@backstage/plugin-scaffolder-backend';
import { ConfigApi } from '@backstage/core-plugin-api';

import { createProjectQuery } from '../queries/createProject';

const id = 'convisoappsec:project:create';

type TemplateActionParameters = {
  label: string;
  goal: string;
  scope: string;
  typeId: number;
  estimatedStartDate: string;
  tags: string[];
};

export const createAppSecFlowProject = (options: { config: ConfigApi }) => {
  return createTemplateAction<TemplateActionParameters>({
    id: id,
    description: 'Creates a new project in AppSecFlow',
    schema: {
      input: {
        required: ['label', 'goal', 'scope', 'typeId'],
        type: 'object',
        properties: {
          label: {
            type: 'string',
            title: 'Name',
            description:
              'Name of the project to be created in AppSecFlow. Example: "My Project"',
          },
          goal: {
            type: 'string',
            title: 'Goal',
            description:
              'Key of the project to identify the project in AppSecFlow. Example: "my-project"',
          },
          scope: {
            type: 'string',
            title: 'Scope',
            description:
              'Scope of the project. If not provided, the default main branch name will be used',
          },
          typeId: {
            type: 'number',
            title: 'Type ID',
            description: 'Type ID',
          },
          estimatedStartDate: {
            type: 'string',
            title: 'Start Date',
            description: 'Estimated date when analysis will start',
          },
          tags: {
            type: 'array',
            items: {
              type: 'string',
            },
            title: 'Project Tags',
            description: 'Type ID',
          },
        },
      },
      output: {
        type: 'object',
        properties: {
          projectId: {
            title: 'AppSecFlow Project ID',
            type: 'string',
            description: 'ID of the project created by this action',
          },
          projectApiCode: {
            title: 'Project API code',
            type: 'string',
            description: 'Internal identificator',
          },
          projectPid: {
            title: 'Project PID',
            type: 'string',
            description: 'Internal project identification in alpha format',
          },
        },
      },
    },
    async handler(ctx) {
      const { label, goal, scope, typeId, estimatedStartDate, tags } =
        ctx.input;

      // validate required fields
      if (!label) {
        throw new Error('"label" is a required input parameter');
      }

      if (!goal) {
        throw new Error('"goal" is a required input parameter');
      }

      if (!scope) {
        throw new Error('"scope" is a required input parameter');
      }

      if (!typeId || typeId <= 0) {
        throw new Error(
          '"typeId" is a required input parameter or has a invalid content',
        );
      }
      // configuration info
      const baseUrl = options.config.getString('conviso.baseUrl');
      const companyId = options.config.getNumber('conviso.companyId');

      // Graphql Mutation Query
      const mutationQuery = JSON.stringify({
        query: createProjectQuery,
        variables: {
          companyId: companyId,
          label: label,
          goal: goal,
          scope: scope,
          typeId: typeId,
          playbooksIds: [1],
          startDate: estimatedStartDate,
          tags: tags || [],
        },
      });

      const graphqlUrl = encodeURI(`${baseUrl}/graphql`);

      // Request Headers
      const myHeaders: HeadersInit = new Headers();
      myHeaders.set('Content-Type', 'application/json');
      myHeaders.set('Accept', 'application/json');
      myHeaders.set('x-api-key', options.config.getString('conviso.x-api-key'));

      // Request Parameters
      const requestOptions: RequestInit = {
        method: 'POST',
        headers: myHeaders,
        body: mutationQuery,
        redirect: 'follow',
        credentials: 'include',
      };

      const response = await fetch(graphqlUrl, requestOptions);
      let responseBody;

      if (!response.ok) {
        let errorMessage: string = response.statusText;
        if (response.status === 401) {
          errorMessage = 'Unauthorized, please use a valid token';
        } else if (response.status === 404) {
          errorMessage =
            'Backend URL Not Found. please check the correct graphql URL';
        } else if (!response.statusText) {
          responseBody = await response.json();
          const errorList = responseBody.errors;
          errorMessage = errorList[0].msg;
        }

        throw new Error(
          `Failed to create project, status ${response.status} - ${errorMessage}`,
        );
      } else {
        responseBody = await response.json();
        if (responseBody.errors && responseBody.errors[0]?.message) {
          const errorMessage = responseBody.errors[0]?.message;
          throw new Error(`Failed to create project - ${errorMessage}`);
        } else if (responseBody.data?.createProject?.errors[0]) {
          const errorMessage = responseBody.data.createProject.errors[0];
          throw new Error(`Failed to create project - ${errorMessage}`);
        }
      }

      // graphql response
      const projectId = responseBody?.data?.createProject?.project?.id;
      const projectApiCode =
        responseBody?.data?.createProject?.project?.apiCode;
      const projectPid = responseBody?.data?.createProject?.project?.pid;

      // conviso project URL
      const projectUrl = `${baseUrl}/scopes/${companyId}/projects/${projectId}`;

      ctx.logger.info(
        `New project has been created with id ${projectId} at ${projectUrl} .`,
      );

      ctx.output('projectUrl', projectUrl);
      ctx.output('projectId', projectId);
      ctx.output('projectApiCode', projectApiCode);
      ctx.output('projectPid', projectPid);
    },
  });
};
