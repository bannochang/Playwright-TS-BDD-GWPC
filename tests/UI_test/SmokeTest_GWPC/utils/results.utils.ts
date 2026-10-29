
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const resultsPath = path.resolve(
  'tests/UI_test/SmokeTest_GWPC/results.json',
);

export interface PolicyResult {
  AccountNumber?: string;
  SubmissionNumber?: string;
  PolicyNumber?: string;
  PolicyStatus?: string;
}

interface ResultsFile {
  PolicyResults: Record<string, PolicyResult>;
}


export async function savePolicyResult(
  runId: string,
  result: PolicyResult,
): Promise<void> {
  let results: ResultsFile = { PolicyResults: {} };

  try {
    const contents = await readFile(resultsPath, 'utf8');
    const parsed: unknown = JSON.parse(contents);

    if (
      !isRecordForResults(parsed) ||
      !isRecordForResults(parsed.PolicyResults)
    ) {
      throw new Error('Invalid results.json structure.');
    }

    results = parsed as unknown as ResultsFile;
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      // The file will be created on the first save.
    } else {
      throw error;
    }
  }

  results.PolicyResults[runId] = {
    ...results.PolicyResults[runId],
    ...result,
  };

  await writeFile(
    resultsPath,
    JSON.stringify(results, null, 2),
    'utf8',
  );
}

function isRecordForResults(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
export async function getPolicyResult(
  runId: string,
): Promise<PolicyResult> {
  let contents: string;

  try {
    contents = await readFile(resultsPath, 'utf8');
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      throw new Error(
        'results.json does not exist. Issue a policy and save its results first.',
      );
    }

    throw error;
  }

  const parsed: unknown = JSON.parse(contents);

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('PolicyResults' in parsed) ||
    typeof parsed.PolicyResults !== 'object' ||
    parsed.PolicyResults === null ||
    Array.isArray(parsed.PolicyResults)
  ) {
    throw new Error('Invalid results.json structure.');
  }

  const policyResults = parsed.PolicyResults as Record<
    string,
    PolicyResult
  >;

  const result = policyResults[runId];

  if (!result) {
    throw new Error(`No policy results found for run "${runId}".`);
  }

  return result;
}
export async function getIssuedPolicyNumber(
  runId: string,
): Promise<string> {
  const result = await getPolicyResult(runId);
  const policyNumber = result.PolicyNumber?.trim();

  if (!policyNumber) {
    throw new Error(
      `Policy number is missing for run "${runId}".`,
    );
  }

  return policyNumber;
}
