/**
 * Usage Statistics Component
 * Displays API key usage statistics and metrics
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  BarChart3,
  Key,
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Activity,
} from 'lucide-react';
import type { UsageStats as UsageStatsData } from '@/lib/ai-keys';
import { AIProvider, AI_PROVIDERS } from '@/lib/encryption';

interface UsageStatsProps {
  stats: UsageStatsData;
}

function getProviderIcon(provider: AIProvider) {
  switch (provider) {
    case 'openai':
      return '🤖';
    case 'anthropic':
      return '🧠';
    case 'google':
      return '🔍';
    default:
      return '🔑';
  }
}

function getDaysAgo(dateString: string) {
  const now = new Date();
  const days = Math.floor((now.getTime() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export function UsageStats({ stats }: UsageStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Usage Statistics
        </CardTitle>
        <CardDescription>Overview of your API key usage and activity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <Key className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <div className="text-2xl font-bold">{stats.totalKeys}</div>
            <div className="text-sm text-muted-foreground">Total Keys</div>
          </div>

          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <Activity className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <div className="text-2xl font-bold">
              {Object.values(stats.keysByProvider).reduce((sum, count) => sum + count, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Active Keys</div>
          </div>

          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-600">
              {Object.values(stats.keysByProvider).reduce((sum, count) => sum + count, 0) -
                stats.expiredKeys.length}
            </div>
            <div className="text-sm text-muted-foreground">Valid Keys</div>
          </div>

          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold text-orange-600">{stats.expiredKeys.length}</div>
            <div className="text-sm text-muted-foreground">Expired Keys</div>
          </div>
        </div>

        {/* Keys by Provider */}
        <div>
          <h4 className="text-sm font-medium mb-3">Keys by Provider</h4>
          <div className="space-y-2">
            {Object.entries(AI_PROVIDERS).map(([provider, config]) => {
              const count = stats.keysByProvider[provider as AIProvider] || 0;
              const percentage = stats.totalKeys > 0 ? (count / stats.totalKeys) * 100 : 0;

              return (
                <div
                  key={provider}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-lg">{getProviderIcon(provider as AIProvider)}</div>
                    <div>
                      <div className="font-medium">{config.name}</div>
                      <div className="text-sm text-muted-foreground">{count} keys</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{percentage.toFixed(1)}%</div>
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h4 className="text-sm font-medium mb-3">Recent Activity</h4>
          {Object.keys(stats.lastUsedTimes).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2" />
              <div>No usage activity yet</div>
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(stats.lastUsedTimes)
                .sort(([, a], [, b]) => new Date(b).getTime() - new Date(a).getTime())
                .slice(0, 5)
                .map(([keyId, lastUsed]) => {
                  // Find the provider for this key (simplified approach)
                  const provider =
                    (Object.keys(AI_PROVIDERS).find(
                      (p) => stats.keysByProvider[p as AIProvider] > 0
                    ) as AIProvider) || 'openai';

                  return (
                    <div key={keyId} className="flex items-center justify-between p-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="text-sm">{getProviderIcon(provider)}</div>
                        <span className="font-mono text-xs">{keyId.slice(-8)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{getDaysAgo(lastUsed)}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Expired Keys Warning */}
        {stats.expiredKeys.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                Expired Keys
              </h4>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-800 mb-2">
                  You have {stats.expiredKeys.length} API key
                  {stats.expiredKeys.length > 1 ? 's' : ''} that are older than 90 days.
                </p>
                <p className="text-xs text-orange-700">
                  For security reasons, consider updating or replacing expired keys. Most providers
                  recommend rotating keys every 90 days.
                </p>
                <div className="mt-2">
                  <Badge variant="outline" className="text-orange-800 border-orange-300">
                    {stats.expiredKeys.length} key{stats.expiredKeys.length > 1 ? 's' : ''} need
                    attention
                  </Badge>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Storage Info */}
        <Separator />
        <div className="text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Storage location: Local (IndexedDB)</span>
            <span>Encryption: AES-256</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span>Data sync: Browser only</span>
            <span>Privacy: End-to-end encrypted</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
