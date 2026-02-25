import { useOllama } from '../hooks/use-ollama';

export function OllamaStatus() {
  const { running } = useOllama();

  return (
    <div
      className="w-10 h-10 flex items-center justify-center"
      title={running ? 'Ollama connected' : 'Ollama offline'}
    >
      <div
        className={`w-2.5 h-2.5 rounded-full transition-colors ${
          running ? 'bg-success' : 'bg-text-muted'
        }`}
      />
    </div>
  );
}
