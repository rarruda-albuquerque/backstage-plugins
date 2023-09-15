import { PassThrough } from 'stream';
import os from 'os';
import { createAppSecFlowProject } from './createAppSecFlowProject';
import { getVoidLogger } from '@backstage/backend-common';
import { ConfigReader } from '@backstage/config';

describe('convisoappsec:project:create', () => {
  // API configuration
  const mockConfig = new ConfigReader({
    conviso: {
      baseUrl: 'https://convisoappsec.com',
      'x-api-key': 'token',
      companyId: 1,
    },
  });

  const action = createAppSecFlowProject({ config: mockConfig });

  const logger = getVoidLogger();
  jest.spyOn(logger, 'info');
  const mockContext = {
    workspacePath: os.tmpdir(),
    logger,
    logStream: new PassThrough(),
    output: jest.fn(),
    createTemporaryDirectory: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should validate action.id', async () => {
    expect(action.id).toEqual('appsecflow:project:create');
  });

  it('should throw an exception due to invalid configuration', async () => {
    // API configuration
    const config = new ConfigReader({});

    const ac = createAppSecFlowProject({ config });

    await expect(() =>
      ac.handler({
        ...mockContext,
        input: {
          label: 'project-acme',
          goal: 'test',
          scope: 'test',
          typeId: 1,
          estimatedStartDate: '2023-09-01',
          tags: ['tag1', 'tag2'],
        },
      }),
    ).rejects.toThrow("Missing required config value at 'conviso.baseUrl'");
  });

  describe('Validating inputs to the action', () => {
    it('should throw and exception with a missing label property', async () => {
      await expect(() =>
        action.handler({
          ...mockContext,
          input: {
            label: '',
            goal: 'test',
            scope: 'test',
            typeId: 1,
            estimatedStartDate: '2023-09-01',
            tags: ['tag1', 'tag2'],
          },
        }),
      ).rejects.toThrow('"label" is a required input parameter');
    });

    it('should throw and exception with a missing goal property', async () => {
      await expect(() =>
        action.handler({
          ...mockContext,
          input: {
            label: 'project-acme',
            goal: '',
            scope: 'test',
            typeId: 1,
            estimatedStartDate: '2023-09-01',
            tags: ['tag1', 'tag2'],
          },
        }),
      ).rejects.toThrow('"goal" is a required input parameter');
    });

    it('should throw and exception with a missing scope property', async () => {
      await expect(() =>
        action.handler({
          ...mockContext,
          input: {
            label: 'project-acme',
            goal: 'test',
            scope: '',
            typeId: 1,
            estimatedStartDate: '2023-09-01',
            tags: ['tag1', 'tag2'],
          },
        }),
      ).rejects.toThrow('"scope" is a required input parameter');
    });

    it('should throw and exception with and invalid type id', async () => {
      await expect(() =>
        action.handler({
          ...mockContext,
          input: {
            label: 'project-acme',
            goal: 'test',
            scope: 'test',
            typeId: -1,
            estimatedStartDate: '2023-09-01',
            tags: ['tag1', 'tag2'],
          },
        }),
      ).rejects.toThrow(
        '"typeId" is a required input parameter or has a invalid content',
      );
    });
  });
  describe('Project already exists', () => {
    beforeAll(() => {
      global.fetch = () =>
        Promise.resolve({
          status: 200,
          ok: true,
          json: () =>
            Promise.resolve({
              data: {
                createProject: {
                  clientMutationId: null,
                  errors: [
                    'Label has already been taken',
                    'Estimated Start Date deve ser maior ou igual a data de hoje',
                  ],
                  project: null,
                },
              },
            }),
        } as Response);
    });

    it('should throw an exception with error message', async () => {
      await expect(() =>
        action.handler({
          ...mockContext,
          input: {
            label: 'project-acme',
            goal: 'test',
            scope: 'test',
            typeId: 1,
            estimatedStartDate: '2023-09-01',
            tags: ['tag1', 'tag2'],
          },
        }),
      ).rejects.toThrow(
        'Failed to create project - Label has already been taken',
      );
    });
  });

  describe('Sucessful project create', () => {
    beforeAll(() => {
      global.fetch = () =>
        Promise.resolve({
          status: 200,
          ok: true,
          json: () =>
            Promise.resolve({
              data: {
                createProject: {
                  project: {
                    id: '1',
                    apiCode: 'xhy7u989',
                    pid: 'PRJ_001',
                  },
                  errors: [],
                },
              },
            }),
        } as Response);
    });

    it('should create a valid project', async () => {
      await action.handler({
        ...mockContext,
        input: {
          label: 'project-acme',
          goal: 'test',
          scope: 'test',
          typeId: 1,
          estimatedStartDate: '2023-09-01',
          tags: ['tag1', 'tag2'],
        },
      });

      expect(mockContext.output).toHaveBeenCalledWith('projectId', '1');

      expect(logger.info).toHaveBeenCalled();
    });
  });

  describe('HTTP 401 - Unauthorized', () => {
    beforeAll(() => {
      global.fetch = () =>
        Promise.resolve({
          status: 401,
          ok: false,
        } as Response);
    });

    it('should throw an exception due to HTTP 401 response', async () => {
      await expect(() =>
        action.handler({
          ...mockContext,
          input: {
            label: 'project-acme',
            goal: 'test',
            scope: 'test',
            typeId: 1,
            estimatedStartDate: '2023-09-01',
            tags: ['tag1', 'tag2'],
          },
        }),
      ).rejects.toThrow(
        'Failed to create project, status 401 - Unauthorized, please use a valid token',
      );
    });
  });

  describe('HTTP 404 - NotFound', () => {
    beforeAll(() => {
      global.fetch = () =>
        Promise.resolve({
          status: 404,
          ok: false,
        } as Response);
    });

    it('should throw an exception due to HTTP 404 response', async () => {
      await expect(() =>
        action.handler({
          ...mockContext,
          input: {
            label: 'project-acme',
            goal: 'test',
            scope: 'test',
            typeId: 1,
            estimatedStartDate: '2023-09-01',
            tags: ['tag1', 'tag2'],
          },
        }),
      ).rejects.toThrow(
        'Backend URL Not Found. please check the correct graphql URL',
      );
    });
  });
});
