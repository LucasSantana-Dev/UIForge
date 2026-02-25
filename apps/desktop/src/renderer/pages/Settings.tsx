import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Separator,
} from '@siza/ui';
import { SaveIcon, RefreshCwIcon } from 'lucide-react';
import { useOllama } from '../hooks/use-ollama';

export function Settings() {
  const { running, version, models, refresh } = useOllama();
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [selectedModel, setSelectedModel] = useState('');
  const [appVersion, setAppVersion] = useState('');

  useEffect(() => {
    window.siza.getVersion().then(setAppVersion);
    window.siza.getPreference('ollamaBaseUrl').then((url) => {
      if (url) setOllamaUrl(url);
    });
    window.siza.getPreference('ollamaModel').then((model) => {
      if (model) setSelectedModel(model);
    });
  }, []);

  const saveSettings = async () => {
    await window.siza.setPreference('ollamaBaseUrl', ollamaUrl);
    await window.siza.setPreference('ollamaModel', selectedModel);
    await window.siza.setPreference('ollamaEnabled', running);
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 max-w-2xl">
      <h2 className="text-xl font-semibold">Settings</h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ollama</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${running ? 'bg-success' : 'bg-error'}`} />
            <span className="text-sm">{running ? `Connected (v${version})` : 'Not running'}</span>
            <Button variant="ghost" size="sm" onClick={refresh}>
              <RefreshCwIcon className="w-4 h-4" />
            </Button>
          </div>

          <div>
            <Label htmlFor="ollama-url">Base URL</Label>
            <Input
              id="ollama-url"
              value={ollamaUrl}
              onChange={(e) => setOllamaUrl(e.target.value)}
              className="mt-1"
            />
          </div>

          {models.length > 0 && (
            <div>
              <Label htmlFor="model">Model</Label>
              <select
                id="model"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="mt-1 w-full px-3 py-2 bg-surface-1 border border-surface-3 rounded-md text-text-primary"
              >
                <option value="">Select a model</option>
                {models.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name} ({(m.size / 1e9).toFixed(1)}GB)
                  </option>
                ))}
              </select>
            </div>
          )}

          {!running && (
            <p className="text-xs text-text-muted">
              Install Ollama from <span className="text-brand">ollama.com</span> to enable local AI
              generation.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">MCP Server</CardTitle>
        </CardHeader>
        <CardContent>
          <McpStatusDisplay />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveSettings}>
          <SaveIcon className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>

      <Separator />
      <p className="text-xs text-text-muted">Siza Desktop v{appVersion}</p>
    </div>
  );
}

function McpStatusDisplay() {
  const [status, setStatus] = useState<{
    connected: boolean;
    toolCount: number;
  } | null>(null);

  useEffect(() => {
    window.siza.getMcpStatus().then(setStatus);
  }, []);

  if (!status) return <p className="text-sm text-text-muted">Loading...</p>;

  return (
    <div className="flex items-center gap-3">
      <div className={`w-2.5 h-2.5 rounded-full ${status.connected ? 'bg-success' : 'bg-error'}`} />
      <span className="text-sm">
        {status.connected ? `Connected (${status.toolCount} tools)` : 'Disconnected'}
      </span>
    </div>
  );
}
