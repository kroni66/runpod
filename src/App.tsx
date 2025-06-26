import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import PodList from './components/PodList';
import { getRunpodAPI, Pod } from './utils/runpodAPI';

const GlobalStyle = createGlobalStyle`
  body {
    background: #0f1116;
    color: #e9ecef;
    margin: 0;
    font-family: 'Inter', 'Segoe UI', 'Roboto', 'Arial', sans-serif;
  }

  * {
    box-sizing: border-box;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const Container = styled.div`
  max-width: 780px;
  margin: 40px auto 0 auto;
  padding: 40px 32px 32px 32px;
  background: linear-gradient(145deg, #1a1d25, #21242b);
  border-radius: 24px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.5s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
`;

const Logo = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #4a90e2, #6a5acd);
  border-radius: 12px;
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 20px;
  color: white;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
`;

const TitleArea = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  margin: 0 0 6px 0;
  font-size: 2.2rem;
  letter-spacing: -1px;
  font-weight: 700;
  background: linear-gradient(90deg, #e9ecef, #4a90e2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.div`
  color: #bbc2cf;
  font-size: 1.08rem;
  line-height: 1.4;
`;

const KeyInput = styled.input`
  width: 100%;
  font-size: 1rem;
  background: rgba(25, 27, 32, 0.7);
  color: #e9ecef;
  border: 1px solid #33353a;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 28px;
  outline: none;
  transition: all 0.2s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
  &:focus {
    border-color: #4a90e2;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
  }
`;

const ErrorMsg = styled.div`
  background: linear-gradient(90deg, #37232a, #3d1a24);
  color: #ff759d;
  padding: 14px 16px;
  margin-bottom: 22px;
  border-radius: 12px;
  font-size: 0.98rem;
  border-left: 4px solid #ff5277;
  box-shadow: 0 4px 12px rgba(255, 82, 119, 0.1);
`;

declare global {
  interface Window {
    runpodAPI?: {
      listPods: (apiKey: string) => Promise<{ pods?: any[]; error?: string }>;
      startPod: (apiKey: string, podId: string) => Promise<any>;
      stopPod: (apiKey: string, podId: string) => Promise<any>;
    };
  }
}

function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('runpodApiKey') ?? '');
  const [pods, setPods] = useState<Pod[]>([]);
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
      const api = getRunpodAPI();
      const res = await api.listPods(apiKey);
      if (res.error) {
        // Provide more helpful error messages for common issues
        if (res.error.includes('Failed to fetch') || res.error.includes('CORS')) {
          setError('Unable to connect to Runpod API. This may be due to CORS restrictions when running in web mode. For full functionality, please use the Electron desktop app.');
        } else if (res.error.includes('401') || res.error.includes('Unauthorized')) {
          setError('Invalid API key. Please check your Runpod API key and try again.');
        } else {
          setError(res.error);
        }
      } else {
        setPods(res.pods ?? []);
      }
    } catch (e: any) {
      if (e.message.includes('Failed to fetch') || e.message.includes('CORS')) {
        setError('Unable to connect to Runpod API. This may be due to CORS restrictions when running in web mode. For full functionality, please use the Electron desktop app.');
      } else {
        setError(e.message);
      }
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
        <Header>
          <Logo>RP</Logo>
          <TitleArea>
            <Title>Runpod Manager</Title>
            <Subtitle>
              Manage your <b>Runpod.io</b> pods from your desktop
              {!window.runpodAPI && (
                <div style={{ 
                  marginTop: '8px', 
                  padding: '6px 12px', 
                  background: 'rgba(226, 173, 19, 0.1)', 
                  color: '#e2ad13', 
                  borderRadius: '8px', 
                  fontSize: '0.85rem',
                  border: '1px solid rgba(226, 173, 19, 0.2)'
                }}>
                  ⚠️ Running in web mode - some features may be limited
                </div>
              )}
            </Subtitle>
          </TitleArea>
        </Header>
        
        <KeyInput
          type="password"
          placeholder="Enter your Runpod API Key"
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
        
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: '#6c757d' }}>
          Need an API key? Get it from your <a href="https://runpod.io/console/user/settings" target="_blank" rel="noopener noreferrer" style={{ color: '#4a90e2', textDecoration: 'none' }}>Runpod account settings</a>
        </div>
      </Container>
    </>
  );
}

export default App;