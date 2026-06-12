import { getCircleCIClient } from '../../clients/client.js';

export type GetLatestPipelineWorkflowsParams = {
  projectSlug: string;
  branch?: string;
};

export const getLatestPipelineWorkflows = async ({
  projectSlug,
  branch,
}: GetLatestPipelineWorkflowsParams) => {
  const circleci = getCircleCIClient();

  const pipelines = await circleci.pipelines.getPipelines({
    projectSlug,
    branch,
  });

  const latestPipeline = pipelines?.[0];

  if (!latestPipeline) {
    throw new Error('Latest pipeline not found');
  }

  const workflows = await circleci.workflows.getPipelineWorkflows({
    pipelineId: latestPipeline.id,
  });

  return workflows;
};
