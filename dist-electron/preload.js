"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const node_fetch_1 = __importDefault(require("node-fetch"));
const RUNPOD_API_URL = 'https://api.runpod.io/graphql';
async function runpodRequest(apiKey, body) {
    if (!apiKey)
        throw new Error('Runpod API key required');
    const resp = await (0, node_fetch_1.default)(RUNPOD_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: apiKey,
        },
        body: JSON.stringify(body),
    });
    if (!resp.ok)
        throw new Error(`Runpod API error: ${resp.status} ${resp.statusText}`);
    const json = await resp.json();
    if (json.errors)
        throw new Error(json.errors[0]?.message || 'GraphQL error');
    return json.data;
}
electron_1.contextBridge.exposeInMainWorld('runpodAPI', {
    async listPods(apiKey) {
        try {
            const data = await runpodRequest(apiKey, {
                query: `query Pods { myself { pods { id name desiredStatus runtime { uptimeInSeconds gpus { gpuUtilPercent memoryUtilPercent } ports { ip publicPort isIpPublic } } } } }`,
            });
            return { pods: data?.myself?.pods ?? [] };
        }
        catch (e) {
            return { error: e.message };
        }
    },
    async stopPod(apiKey, podId) {
        try {
            const data = await runpodRequest(apiKey, {
                query: `mutation StopPod($podId: String!) { podStop(input: {podId: $podId}) { id desiredStatus } }`,
                variables: { podId },
            });
            return data?.podStop;
        }
        catch (e) {
            return { error: e.message };
        }
    },
    async startPod(apiKey, podId) {
        try {
            const data = await runpodRequest(apiKey, {
                query: `mutation ResumePod($podId: String!, $bidPerGpu: Float!, $gpuCount: Int!) { podBidResume(input: { podId: $podId, bidPerGpu: $bidPerGpu, gpuCount: $gpuCount }) { id desiredStatus } }`,
                variables: { podId, bidPerGpu: 0.2, gpuCount: 1 },
            });
            return data?.podBidResume;
        }
        catch (e) {
            return { error: e.message };
        }
    },
});
