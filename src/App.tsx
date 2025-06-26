import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import PodList from './components/PodList';

const GlobalStyle = createGlobalStyle`
  body {
    background: #15171a;
    color: #e9ecef;
    margin: 0;
    font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
  }
`;

const Container = styled.div`
  max-width: 680px;
  margin: 32px auto 0 auto;
  padding: 36px 28px 28px 28px;
  background: #21242b;
  border-radius: 18px;
  box-shadow: 0 6px 32px #000c 0.06;
`;

const Title = styled.h1`
  margin-bottom: 12px;
  font-size: 2.1rem;
  letter-spacing: -1px;
  font-weight: 700;
`;

const Subtitle = styled.div`
  margin-bottom: 24px;
  color: #bbc2cf;
  font-size: 1.08rem;
`;

const KeyInput = styled.input`
  width: 100%;
  font-size: 1rem;
  background: #191b20;
  color: #e9ecef;
  border: 1px solid #33353a;
  border-radius: 7px;
  padding: 10px 12px;
  margin-bottom: 24px;
  outline: none;
  &:focus {
    border-color: #4a90e2;
  }
`;

const ErrorMsg = styled.div`
  background: #37232a;
  color: #ff759d;
  padding: 10px 12px;
  margin-bottom: 18px;
  border-radius: 7px;
  font-size: 0.98rem;
`;

declare global {
  interface Window {
    runpodAPI: {
      listPods: (apiKey: string) => Promise<{ pods?: any[]; error?: string }>;
      startPod: (apiKey: string, podId: string) => Promise<any>;
      stopPod: (apiKey: string, podId: string) => Promise<any>;
    };
  }
}

function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('runpodApiKey') ?? '');
  const [pods, setPods] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
    localStorage.setItem('runpodApiKey', e.target.value);
  };

  const fetchPods = async () => {
    if (!apiKey) {
      setError('Please enter your Runpod API Key.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await window.runpodAPI.listPods(apiKey);
      if (res.error) setError(res.error);
      else setPods(res.pods ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (apiKey) fetchPods();
    // eslint-disable-next-line
  }, [apiKey]);

  return (
    <>
      <GlobalStyle />
      <Container>
        <Title>Runpod Pod Manager</Title>
        <Subtitle>
          Manage your <b>Runpod.io</b> pods from your desktop.<br />
          <span style={{ fontSize: '0.98em', opacity: 0.7 }}>
            Enter your <a href="https://runpod.io/console/user/settings" target="_blank" rel="noopener noreferrer" style={{ color: '#4a90e2' }}>Runpod API Key</a> below.
          </span>
        </Subtitle>
        <KeyInput
          type="password"
          placeholder="Runpod API Key"
          value={apiKey}
          onChange={handleApiKeyChange}
        />
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <PodList
          pods={pods}
          loading={loading}
          apiKey={apiKey}
          onRefresh={fetchPods}
          onError={setError}
        />
      </Container>
    </>
  );
}

export default App;