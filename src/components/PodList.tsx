import React from 'react';
import styled from 'styled-components';
import PodItem from './PodItem';

const ListContainer = styled.div`
  background: #191b20;
  border-radius: 12px;
  padding: 18px;
  min-height: 120px;
`;

const EmptyMsg = styled.div`
  color: #9095a0;
  text-align: center;
  margin-top: 32px;
`;

const RefreshButton = styled.button`
  background: #232630;
  border: none;
  color: #b5cfff;
  border-radius: 6px;
  padding: 8px 18px;
  font-size: 0.99rem;
  float: right;
  cursor: pointer;
  transition: background 0.15s;
  &:hover {
    background: #313552;
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
  pods: Pod[];
  loading: boolean;
  apiKey: string;
  onRefresh: () => void;
  onError: (err: string | null) => void;
};

const PodList: React.FC<Props> = ({ pods, loading, apiKey, onRefresh, onError }) => {
  return (
    <div>
      <RefreshButton onClick={onRefresh}>{loading ? 'Refreshing...' : 'Refresh'}</RefreshButton>
      <ListContainer>
        {pods.length === 0 && !loading && (
          <EmptyMsg>No pods found for this account/API key.</EmptyMsg>
        )}
        {pods.map((pod) => (
          <PodItem
            key={pod.id}
            pod={pod}
            apiKey={apiKey}
            onAction={onRefresh}
            onError={onError}
          />
        ))}
      </ListContainer>
    </div>
  );
};

export default PodList;