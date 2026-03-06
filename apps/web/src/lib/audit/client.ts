export interface AuditEvent {
  timestamp: string;
  event_type: string;
  severity: string;
  user_id: string | null;
  request_id: string | null;
  ip_address: string | null;
  details: Record<string, unknown>;
}

export interface AuditEventsResponse {
  events: AuditEvent[];
  total: number;
  page: number;
  page_size: number;
}

export interface AuditSummary {
  total_events: number;
  events_by_type: Record<string, number>;
  events_by_severity: Record<string, number>;
  recent_events: AuditEvent[];
}

export interface AuditFilters {
  page?: number;
  page_size?: number;
  event_type?: string;
  severity?: string;
  user_id?: string;
}

function getGatewayUrl(): string {
  const url = process.env.MCP_GATEWAY_URL ?? process.env.NEXT_PUBLIC_MCP_GATEWAY_URL;
  if (!url) throw new Error('MCP_GATEWAY_URL not configured');
  return url.replace(/\/$/, '');
}

function getGatewayJwt(): string {
  const jwt = process.env.MCP_GATEWAY_JWT;
  if (!jwt) throw new Error('MCP_GATEWAY_JWT not configured');
  return jwt;
}

export async function fetchAuditEvents(
  filters: AuditFilters = {}
): Promise<AuditEventsResponse> {
  const baseUrl = getGatewayUrl();
  const jwt = getGatewayJwt();

  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.page_size) params.set('page_size', String(filters.page_size));
  if (filters.event_type) params.set('event_type', filters.event_type);
  if (filters.severity) params.set('severity', filters.severity);
  if (filters.user_id) params.set('user_id', filters.user_id);

  const qs = params.toString();
  const url = `${baseUrl}/api/audit/events${qs ? `?${qs}` : ''}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${jwt}`,
      'Content-Type': 'application/json',
    },
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    throw new Error(`Audit API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function fetchAuditSummary(): Promise<AuditSummary> {
  const baseUrl = getGatewayUrl();
  const jwt = getGatewayJwt();

  const res = await fetch(`${baseUrl}/api/audit/summary`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
      'Content-Type': 'application/json',
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Audit API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
