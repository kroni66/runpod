import React from 'react';
import styled from 'styled-components';
import PodItem from './PodItem';
import { Pod } from '../utils/runpodAPI';

const ListContainer = styled.div`
  background: rgba(25, 27, 32, 0.7);
  border-radius: 16px;
  padding: 22px;
  min-height: 140px;
  border: 1px solid rgba(255, 255, 255, 0.03);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ListHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const ListTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #e9ecef;
`;

const EmptyMsg = styled.div`
  color: #9095a0;
  text-align: center;
  margin-top: 40px;
  margin-bottom: 40px;
  font-size: 1.05rem;
`;

const RefreshButton = styled.button`
  background: linear-gradient(90deg, #2c3142, #232630);
  border: none;
  color: #b5cfff;
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 0.99rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  
  &:hover {
    background: linear-gradient(90deg, #313552, #2c3142);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  &:before {
    content: "↻";
    margin-right: 8px;
    font-size: 1.1rem;
  }
`;

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
      <ListHeader>
        <ListTitle>Your Pods</ListTitle>
        <RefreshButton onClick={onRefresh}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </RefreshButton>
      </ListHeader>
      
      <ListContainer>
        {pods.length === 0 && !loading && (
          <EmptyMsg>
            No pods found for this account. Please check your API key or create a pod on Runpod.io
          </EmptyMsg>
        )}
        
        {loading && pods.length === 0 && (
          <EmptyMsg>Loading your pods...</EmptyMsg>
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