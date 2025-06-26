import { contextBridge } from 'electron';
import fetch from 'node-fetch';

const RUNPOD_API_URL = 'https://api.runpod.io/graphql';

export type Pod = {
  id: string;
  name: string;
  desiredStatus: string;
  runtime?: {
    uptimeInSeconds?: number;
    gpus?: { gpuUtilPercent?: number; memoryUtilPercent?: number }[];
    ports?: { ip?: string; publicPort?: number; isIpPublic?: boolean }[];
  };
};

async function runpodRequest(apiKey: string, body: object) {
  if (!apiKey) throw new Error('Runpod API key required');
  const resp = await fetch(RUNPOD_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: apiKey,
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw new Error(`Runpod API error: ${resp.status} ${resp.statusText}`);
  const json = await resp.json() as any;
  if (json.errors) throw new Error(json.errors[0]?.message || 'GraphQL error');
  return json.data;
}

contextBridge.exposeInMainWorld('runpodAPI', {
  async listPods(apiKey: string) {
    try {
      const data = await runpodRequest(apiKey, {
        query: `query Pods { myself { pods { id name desiredStatus runtime { uptimeInSeconds gpus { gpuUtilPercent memoryUtilPercent } ports { ip publicPort isIpPublic } } } } }`,
      });
      return { pods: data?.myself?.pods ?? [] };
    } catch (e: any) {
      return { error: e.message };
    }
  },
  async stopPod(apiKey: string, podId: string) {
    try {
      const data = await runpodRequest(apiKey, {
        query: `mutation StopPod($podId: String!) { podStop(input: {podId: $podId}) { id desiredStatus } }`,
        variables: { podId },
      });
      return data?.podStop;
    } catch (e: any) {
      return { error: e.message };
    }
  },
  async startPod(apiKey: string, podId: string) {
    try {
      const data = await runpodRequest(apiKey, {
        query: `mutation ResumePod($podId: String!, $bidPerGpu: Float!, $gpuCount: Int!) { podBidResume(input: { podId: $podId, bidPerGpu: $bidPerGpu, gpuCount: $gpuCount }) { id desiredStatus } }`,
        variables: { podId, bidPerGpu: 0.2, gpuCount: 1 },
      });
      return data?.podBidResume;
    } catch (e: any) {
      return { error: e.message };
    }
  },
});