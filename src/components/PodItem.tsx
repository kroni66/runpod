import React, { useState } from 'react';
import styled from 'styled-components';

const Item = styled.div`
  background: #242730;
  border-radius: 8px;
  margin-bottom: 13px;
  padding: 15px 17px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;

const Info = styled.div`
  flex: 1;
`;

const PodName = styled.div`
  font-weight: 600;
  font-size: 1.09rem;
  color: #b5cfff;
  margin-bottom: 6px;
`;

const Status = styled.div<{ status: string }>`
  display: inline-block;
  padding: 2px 11px;
  border-radius: 8px;
  font-size: 0.98rem;
  margin-bottom: 8px;
  background: ${({ status }) =>
    status === 'RUNNING'
      ? 'linear-gradient(90deg, #13e26b11, #13e26b33)'
      : status === 'STOPPED'
      ? 'linear-gradient(90deg, #6f7a8a11, #6f7a8a33)'
      : 'linear-gradient(90deg, #e2ad1311, #e2ad1333)'};
  color: ${({ status }) =>
    status === 'RUNNING' ? '#13e26b' : status === 'STOPPED' ? '#bfc6d1' : '#e2ad13'};
  font-weight: 500;
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-left: 18px;
`;

const ActionBtn = styled.button<{ color?: string }>`
  background: ${({ color }) => color ?? '#232634'};
  color: #f3f6fa;
  border: none;
  border-radius: 7px;
  padding: 7px 17px;
  font-size: 0.99rem;
  margin-bottom: 7px;
  cursor: pointer;
  font-weight: 500;
  box-shadow: 0 2px 6px #0003;
  transition: background 0.16s;
  &:hover {
    background: ${({ color }) => (color ? '#1e4f37' : '#2e3258')};
  }
`;

const StatRow = styled.div`
  font-size: 0.93rem;
  color: #7e93b9;
  margin-bottom: 2px;
`;

type Pod = {
  id: string;
  name: string;
  desiredStatus: string;
  runtime?: {
    uptimeInSeconds?: number;
    gpus?: { gpuUtilPercent?: number; memoryUtilPercent?: number }[];
    ports?: { ip?: string; publicPort?: number; isIpPublic?: boolean }[];
  };
};

type Props = {
  pod: Pod;
  apiKey: string;
  onAction: () => void;
  onError: (err: string | null) => void;
};

function formatUptime(seconds?: number) {
  if (!seconds) return '-';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

const PodItem: React.FC<Props> = ({ pod, apiKey, onAction, onError }) => {
  const [actioning, setActioning] = useState(false);

  const handleStart = async () => {
    setActioning(true);
    onError(null);
    try {
      const res = await window.runpodAPI.startPod(apiKey, pod.id);
      if (res.error) onError(res.error);
      else onAction();
    } catch (e: any) {
      onError(e.message);
    } finally {
      setActioning(false);
    }
  };

  const handleStop = async () => {
    setActioning(true);
    onError(null);
    try {
      const res = await window.runpodAPI.stopPod(apiKey, pod.id);
      if (res.error) onError(res.error);
      else onAction();
    } catch (e: any) {
      onError(e.message);
    } finally {
      setActioning(false);
    }
  };

  return (
    <Item>
      <Info>
        <PodName>{pod.name || pod.id}</PodName>
        <Status status={pod.desiredStatus}>{pod.desiredStatus}</Status>
        <div>
          <StatRow>
            <b>Uptime:</b> {formatUptime(pod.runtime?.uptimeInSeconds)}
          </StatRow>
          {pod.runtime?.gpus && pod.runtime.gpus.length > 0 && (
            <StatRow>
              <b>GPU:</b> {pod.runtime.gpus[0].gpuUtilPercent ?? '-'}% /{' '}
              {pod.runtime.gpus[0].memoryUtilPercent ?? '-'}% (util/mem)
            </StatRow>
          )}
          {pod.runtime?.ports &&
            pod.runtime.ports
              .filter((port) => port.isIpPublic)
              .map((port, i) => (
                <StatRow key={i}>
                  <b>Public IP:</b> {port.ip}:{port.publicPort}
                </StatRow>
              ))}
        </div>
      </Info>
      <Actions>
        {pod.desiredStatus === 'RUNNING' ? (
          <ActionBtn onClick={handleStop} color="#e24d13" disabled={actioning}>
            {actioning ? 'Stopping...' : 'Stop'}
          </ActionBtn>
        ) : (
          <ActionBtn onClick={handleStart} color="#13e26b" disabled={actioning}>
            {actioning ? 'Starting...' : 'Start'}
          </ActionBtn>
        )}
      </Actions>
    </Item>
  );
};

export default PodItem;