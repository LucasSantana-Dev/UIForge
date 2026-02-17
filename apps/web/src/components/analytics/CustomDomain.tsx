'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Globe, Shield } from 'lucide-react';

interface DomainStatus {
  domain: string;
  status: 'pending' | 'active' | 'error';
  sslStatus: 'pending' | 'active' | 'error';
  dnsRecords?: DNSRecord[];
}

interface DNSRecord {
  type: string;
  name: string;
  value: string;
  ttl: number;
}

export default function CustomDomain() {
  const [domains, setDomains] = useState<DomainStatus[]>([
    {
      domain: 'uiforge.com',
      status: 'pending',
      sslStatus: 'pending',
      dnsRecords: [
        { type: 'A', name: '@', value: '192.168.1.1', ttl: 3600 },
        { type: 'CNAME', name: 'www', value: 'uiforge.pages.dev', ttl: 3600 },
      ],
    },
  ]);

  const [newDomain, setNewDomain] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddDomain = async () => {
    if (!newDomain) return;

    setIsAdding(true);
    
    // Simulate API call to add domain
    setTimeout(() => {
      const newDomainStatus: DomainStatus = {
        domain: newDomain,
        status: 'pending',
        sslStatus: 'pending',
        dnsRecords: [
          { type: 'A', name: '@', value: '192.168.1.1', ttl: 3600 },
          { type: 'CNAME', name: 'www', value: 'uiforge.pages.dev', ttl: 3600 },
        ],
      };

      setDomains([...domains, newDomainStatus]);
      setNewDomain('');
      setIsAdding(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Custom Domain Configuration</h3>
        
        {/* Add New Domain */}
        <div className="mb-6">
          <div className="flex gap-2">
            <Input
              placeholder="Enter your domain (e.g., app.yourdomain.com)"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddDomain} disabled={isAdding || !newDomain}>
              {isAdding ? 'Adding...' : 'Add Domain'}
            </Button>
          </div>
        </div>

        {/* Domain List */}
        <div className="space-y-4">
          {domains.map((domain, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">{domain.domain}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(domain.status)}>
                    {getStatusIcon(domain.status)}
                    <span className="ml-1">{domain.status}</span>
                  </Badge>
                  <Badge className={getStatusColor(domain.sslStatus)}>
                    <Shield className="w-3 h-3 mr-1" />
                    SSL {domain.sslStatus}
                  </Badge>
                </div>
              </div>

              {/* DNS Records */}
              {domain.dnsRecords && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">DNS Records:</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                    <div className="space-y-2 text-sm">
                      {domain.dnsRecords.map((record, recordIndex) => (
                        <div key={recordIndex} className="font-mono">
                          <span className="text-blue-600">{record.type}</span>
                          <span className="mx-2">{record.name}</span>
                          <span className="text-gray-600">→</span>
                          <span className="ml-2">{record.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Configure these DNS records in your domain provider's dashboard.
                  </p>
                </div>
              )}

              {/* Instructions */}
              {domain.status === 'pending' && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Next steps:</strong> Update your DNS records and wait for propagation. 
                    This can take up to 24 hours.
                  </p>
                </div>
              )}

              {domain.status === 'error' && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    <strong>Configuration error:</strong> Please check your DNS records and try again.
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded">
          <h4 className="font-medium mb-2">Setup Instructions:</h4>
          <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
            <li>Add your domain using the form above</li>
            <li>Configure the DNS records in your domain provider</li>
            <li>Wait for DNS propagation (up to 24 hours)</li>
            <li>SSL certificate will be automatically provisioned</li>
            <li>Update your environment variables if needed</li>
          </ol>
        </div>
      </Card>
    </div>
  );
}