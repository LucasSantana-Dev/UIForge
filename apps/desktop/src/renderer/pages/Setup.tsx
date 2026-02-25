import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from '@siza/ui';
import {
  CheckCircleIcon,
  XCircleIcon,
  DownloadIcon,
  ArrowRightIcon,
} from 'lucide-react';
import { useOllama } from '../hooks/use-ollama';

const RECOMMENDED_MODELS = [
  {
    name: 'codellama:7b',
    size: '3.8 GB',
    description: 'Fast code generation, good for most tasks',
  },
  {
    name: 'codellama:13b',
    size: '7.4 GB',
    description: 'Higher quality, slower generation',
  },
];

interface SetupProps {
  onComplete: () => void;
}

export function Setup({ onComplete }: SetupProps) {
  const { running, models, refresh } = useOllama();
  const [step, setStep] = useState<'detect' | 'models' | 'done'>('detect');

  useEffect(() => {
    if (running && models.length > 0) {
      setStep('done');
    } else if (running) {
      setStep('models');
    }
  }, [running, models]);

  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Welcome to Siza</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 'detect' && (
            <>
              <div className="flex items-center gap-3">
                {running ? (
                  <CheckCircleIcon className="w-6 h-6 text-success" />
                ) : (
                  <XCircleIcon className="w-6 h-6 text-error" />
                )}
                <div>
                  <p className="font-medium">Ollama</p>
                  <p className="text-sm text-text-secondary">
                    {running
                      ? 'Detected and running'
                      : 'Not detected — install from ollama.com'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={refresh}>
                  Re-check
                </Button>
                <Button onClick={() => running ? setStep('models') : onComplete()}>
                  {running ? 'Next' : 'Skip for now'}
                  <ArrowRightIcon className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </>
          )}

          {step === 'models' && (
            <>
              <p className="text-sm text-text-secondary">
                {models.length > 0
                  ? `Found ${models.length} model(s). You can start generating!`
                  : 'No models installed. We recommend:'}
              </p>
              {models.length === 0 &&
                RECOMMENDED_MODELS.map((m) => (
                  <div
                    key={m.name}
                    className="flex items-center justify-between p-3 rounded-lg border border-surface-3"
                  >
                    <div>
                      <p className="font-medium text-sm">{m.name}</p>
                      <p className="text-xs text-text-muted">
                        {m.size} — {m.description}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <DownloadIcon className="w-4 h-4 mr-1" />
                      Pull
                    </Button>
                  </div>
                ))}
              {models.length > 0 && (
                <ul className="space-y-1">
                  {models.map((m) => (
                    <li
                      key={m.name}
                      className="text-sm flex items-center gap-2"
                    >
                      <CheckCircleIcon className="w-4 h-4 text-success" />
                      {m.name}
                    </li>
                  ))}
                </ul>
              )}
              <Button onClick={() => setStep('done')}>
                Continue
                <ArrowRightIcon className="w-4 h-4 ml-1" />
              </Button>
            </>
          )}

          {step === 'done' && (
            <>
              <div className="text-center py-4">
                <CheckCircleIcon className="w-12 h-12 text-success mx-auto mb-3" />
                <p className="font-medium">You're all set!</p>
                <p className="text-sm text-text-secondary mt-1">
                  Siza is ready to generate code
                  {running ? ' with local Ollama' : ''}.
                </p>
              </div>
              <Button onClick={onComplete} className="w-full">
                Start Using Siza
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
