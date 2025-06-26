import React, { useState } from 'react';
import styled from 'styled-components';

const Item = styled.div`
  background: linear-gradient(145deg, #242730, #2a2e38);
  border-radius: 14px;
  margin-bottom: 16px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  border: 1px solid rgba(255, 255, 255, 0.03);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Info = styled.div`
  flex: 1;
`;

const PodName = styled.div`
  font-weight: 600;
  font-size: 1.15rem;
  color: #b5cfff;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
`;

const PodIcon = styled.div`
  width: 24px;
  height: 24px;
  background: rgba(74, 144, 226, 0.2);
  border-radius: 6px;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #4a90e2;
`;

const Status = styled.div<{ status: string }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 10px;
  font-size: 0.9rem;
  margin-bottom: 12px;
  background: ${({ status }) =>
    status === 'RUNNING'
      ? 'linear-gradient(90deg, rgba(19, 226, 107, 0.1), rgba(19, 226, 107, 0.2))'
      : status === 'STOPPED'
      ? 'linear-gradient(90deg, rgba(111, 122, 138, 0.1), rgba(111, 122, 138, 0.2))'
      : 'linear-gradient(90deg, rgba(226, 173, 19, 0.1), rgba(226, 173, 19, 0.2))'};
  color: ${({ status }) =>
    status === 'RUNNING' ? '#13e26b' : status === 'STOPPED' ? '#bfc6d1' : '#e2ad13'};
  font-weight: 500;
  
  &:before {
    content: "";
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 8px;
    background-color: ${({ status }) =>
      status === 'RUNNING' ? '#13e26b' : status === 'STOPPED' ? '#bfc6d1' : '#e2ad13'};
  }
`;

const StatsContainer = styled.div`
  background: rgba(25, 27, 32, 0.4);
  border-radius: 10px;
  padding: 12px;
  margin-top: 12px;
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-left: 20px;
`;

const ActionBtn = styled.button<{ color?: string }>`
  background: ${({ color }) => color ?? '#232634'};
  color: #f3f6fa;
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 0.99rem;
  margin-bottom: 10px;
  cursor: pointer;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ color }) => 
      color === '#13e26b' ? '#15c961' : 
      color === '#e24d13' ? '#d14612' : 
      '#2e3258'};
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const StatRow = styled.div`
  font-size: 0.93rem;
  color: #a0b0d0;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  b {
    color: #c5d1e6;
    margin-right: 6px;
    font-weight: 500;
  }
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
        <PodName>
          <PodIcon>P</PodIcon>
          {pod.name || pod.id}
        </PodName>
        <Status status={pod.desiredStatus}>{pod.desiredStatus}</Status>
        
        <StatsContainer>
          <StatRow>
            <b>Uptime:</b> {formatUptime(pod.runtime?.uptimeInSeconds)}
          </StatRow>
          
          {pod.runtime?.gpus && pod.runtime.gpus.length > 0 && (
            <StatRow>
              <b>GPU Usage:</b> 
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginLeft: '4px',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '10px',
                padding: '2px 8px',
                fontSize: '0.85rem'
              }}>
                <span style={{ color: '#13e26b', marginRight: '8px' }}>
                  Util: {pod.runtime.gpus[0].gpuUtilPercent ?? '-'}%
                </span>
                <span style={{ color: '#e2ad13' }}>
                  Mem: {pod.runtime.gpus[0].memoryUtilPercent ?? '-'}%
                </span>
              </div>
            </StatRow>
          )}
          
          {pod.runtime?.ports &&
            pod.runtime.ports
              .filter((port) => port.isIpPublic)
              .map((port, i) => (
                <StatRow key={i}>
                  <b>Public IP:</b> 
                  <code style={{ 
                    background: 'rgba(74, 144, 226, 0.1)', 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem'
                  }}>
                    {port.ip}:{port.publicPort}
                  </code>
                </StatRow>
              ))}
        </StatsContainer>
      </Info>
      
      <Actions>
        {pod.desiredStatus === 'RUNNING' ? (
          <ActionBtn onClick={handleStop} color="#e24d13" disabled={actioning}>
            {actioning ? 'Stopping...' : 'Stop Pod'}
          </ActionBtn>
        ) : (
          <ActionBtn onClick={handleStart} color="#13e26b" disabled={actioning}>
            {actioning ? 'Starting...' : 'Start Pod'}
          </ActionBtn>
        )}
      </Actions>
    </Item>
  );
};

export default PodItem;