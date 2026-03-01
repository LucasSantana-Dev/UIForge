---
name: siza-dashboard-scaffolding
description: Scaffold admin dashboards with navigation, data tables, charts, and responsive layouts
version: 1.0.0
author: Forge Space
tags: [dashboard, admin, data-table, charts, layout, responsive, navigation]
---

# Siza Dashboard Scaffolding

## Overview
Generate enterprise-grade admin dashboards with navigation, data visualization, responsive layouts, and common dashboard patterns. Encode best practices for data tables, charts, metrics, and user experience.

## Instructions

### Layout Patterns

#### 1. Sidebar + Content Layout
```typescript
interface DashboardLayoutProps {
  sidebar: React.ReactNode;
  header?: React.ReactNode;
  children: React.ReactNode;
}

export const DashboardLayout = ({ sidebar, header, children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="dashboard-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}
        aria-label="Main navigation"
      >
        {sidebar}
      </aside>

      {/* Main content */}
      <div className="main-content">
        {header && (
          <header className="dashboard-header">
            <button
              className="sidebar-toggle md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
              aria-expanded={sidebarOpen}
            >
              <MenuIcon />
            </button>
            {header}
          </header>
        )}
        <main className="dashboard-main">{children}</main>
      </div>
    </div>
  );
};
```

CSS structure:
```css
.dashboard-layout {
  display: grid;
  grid-template-columns: 16rem 1fr;
  min-height: 100vh;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 16rem;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  transition: transform 0.3s ease;
}

@media (max-width: 768px) {
  .dashboard-layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    transform: translateX(-100%);
    z-index: 50;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 40;
  }
}

.main-content {
  grid-column: 2;
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .main-content {
    grid-column: 1;
  }
}

.dashboard-main {
  flex: 1;
  padding: 2rem;
  background: var(--bg-color);
}

@media (max-width: 640px) {
  .dashboard-main {
    padding: 1rem;
  }
}
```

#### 2. Top Navigation Layout
```typescript
export const TopNavLayout = ({ nav, children }: { nav: React.ReactNode; children: React.ReactNode }) => {
  return (
    <div className="top-nav-layout">
      <header className="top-nav">
        <div className="container">
          {nav}
        </div>
      </header>
      <main className="main-content">
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  );
};
```

#### 3. Collapsible Sidebar
```typescript
export const CollapsibleSidebar = ({ items }: { items: NavItem[] }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  return (
    <nav className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button
        className="collapse-toggle"
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-expanded={!collapsed}
      >
        {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
      </button>

      <ul className="nav-list" role="list">
        {items.map(item => (
          <li key={item.id}>
            {item.children ? (
              <>
                <button
                  className="nav-group-toggle"
                  onClick={() => toggleGroup(item.id)}
                  aria-expanded={expandedGroups.has(item.id)}
                  aria-controls={`group-${item.id}`}
                >
                  <item.icon aria-hidden="true" />
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && (
                    expandedGroups.has(item.id) ? <ChevronUpIcon /> : <ChevronDownIcon />
                  )}
                </button>
                {expandedGroups.has(item.id) && !collapsed && (
                  <ul id={`group-${item.id}`} className="nav-sublist">
                    {item.children.map(child => (
                      <li key={child.id}>
                        <a href={child.href} className="nav-link">
                          {child.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <a href={item.href} className="nav-link" aria-current={item.active ? 'page' : undefined}>
                <item.icon aria-hidden="true" />
                {!collapsed && <span>{item.label}</span>}
              </a>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};
```

### Data Table Features

#### 1. Sorting
```typescript
type SortDirection = 'asc' | 'desc' | null;

interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}

const useSorting = <T,>(data: T[], initialSort?: SortConfig<T>) => {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(initialSort || null);

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig]);

  const requestSort = (key: keyof T) => {
    setSortConfig(current => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null; // Remove sort
    });
  };

  return { sortedData, sortConfig, requestSort };
};

// Usage in table header
<th>
  <button
    onClick={() => requestSort('name')}
    aria-sort={
      sortConfig?.key === 'name'
        ? sortConfig.direction === 'asc'
          ? 'ascending'
          : 'descending'
        : 'none'
    }
  >
    Name
    {sortConfig?.key === 'name' && (
      sortConfig.direction === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />
    )}
  </button>
</th>
```

#### 2. Filtering
```typescript
interface FilterConfig {
  searchQuery: string;
  status?: string[];
  dateRange?: { start: Date; end: Date };
}

const useFiltering = <T extends Record<string, any>>(data: T[], filters: FilterConfig) => {
  return useMemo(() => {
    return data.filter(item => {
      // Search query (case-insensitive, multiple fields)
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchableFields = ['name', 'email', 'description'];
        const matches = searchableFields.some(field =>
          String(item[field]).toLowerCase().includes(query)
        );
        if (!matches) return false;
      }

      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(item.status)) return false;
      }

      // Date range filter
      if (filters.dateRange) {
        const itemDate = new Date(item.createdAt);
        if (itemDate < filters.dateRange.start || itemDate > filters.dateRange.end) {
          return false;
        }
      }

      return true;
    });
  }, [data, filters]);
};
```

#### 3. Pagination
```typescript
interface PaginationConfig {
  page: number;
  pageSize: number;
}

const usePagination = <T,>(data: T[], config: PaginationConfig) => {
  const { page, pageSize } = config;

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  }, [data, page, pageSize]);

  const totalPages = Math.ceil(data.length / pageSize);

  return {
    paginatedData,
    totalPages,
    currentPage: page,
    totalItems: data.length,
  };
};

// Pagination controls component
export const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  return (
    <nav aria-label="Pagination">
      <ul className="pagination">
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            Previous
          </button>
        </li>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <li key={page}>
            <button
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              className={page === currentPage ? 'active' : ''}
            >
              {page}
            </button>
          </li>
        ))}
        <li>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};
```

#### 4. Row Selection
```typescript
const useRowSelection = <T extends { id: string }>(data: T[]) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map(item => item.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const isSelected = (id: string) => selectedIds.has(id);
  const allSelected = selectedIds.size === data.length && data.length > 0;
  const someSelected = selectedIds.size > 0 && selectedIds.size < data.length;

  return {
    selectedIds,
    toggleRow,
    toggleAll,
    clearSelection,
    isSelected,
    allSelected,
    someSelected,
    selectedCount: selectedIds.size,
  };
};

// Usage in table
<thead>
  <tr>
    <th>
      <input
        type="checkbox"
        checked={allSelected}
        ref={el => {
          if (el) el.indeterminate = someSelected;
        }}
        onChange={toggleAll}
        aria-label="Select all rows"
      />
    </th>
    <th>Name</th>
    <th>Email</th>
  </tr>
</thead>
<tbody>
  {data.map(row => (
    <tr key={row.id}>
      <td>
        <input
          type="checkbox"
          checked={isSelected(row.id)}
          onChange={() => toggleRow(row.id)}
          aria-label={`Select ${row.name}`}
        />
      </td>
      <td>{row.name}</td>
      <td>{row.email}</td>
    </tr>
  ))}
</tbody>
```

### Chart Integration Guidance

#### Recharts (React)
```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const RevenueChart = ({ data }: { data: { month: string; revenue: number }[] }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="var(--primary-color)"
          strokeWidth={2}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
```

Best practices:
- Always wrap charts in `ResponsiveContainer` for responsive sizing
- Use semantic colors from CSS variables
- Provide accessible data tables as alternative for screen readers
- Add loading states for async data
- Format tooltip values (currency, percentages, dates)

#### Chart.js (Framework-agnostic)
```typescript
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export const CategoryPieChart = ({ data }: { data: { label: string; value: number }[] }) => {
  const chartData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        data: data.map(d => d.value),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />;
};
```

### Metric Cards and KPI Displays

```typescript
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    direction: 'up' | 'down';
  };
  icon?: React.ReactNode;
  trend?: Array<{ label: string; value: number }>;
}

export const MetricCard = ({ title, value, change, icon, trend }: MetricCardProps) => {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <h3 className="metric-title">{title}</h3>
        {icon && <div className="metric-icon" aria-hidden="true">{icon}</div>}
      </div>

      <div className="metric-value">{value}</div>

      {change && (
        <div className={`metric-change ${change.direction}`}>
          <span aria-label={`${change.direction === 'up' ? 'Increased' : 'Decreased'} by ${Math.abs(change.value)}%`}>
            {change.direction === 'up' ? '↑' : '↓'} {Math.abs(change.value)}%
          </span>
        </div>
      )}

      {trend && (
        <div className="metric-trend" aria-label="Trend sparkline">
          <svg width="100%" height="40" viewBox="0 0 100 40" preserveAspectRatio="none">
            <polyline
              points={trend.map((d, i) => `${(i / (trend.length - 1)) * 100},${40 - (d.value / Math.max(...trend.map(t => t.value))) * 40}`).join(' ')}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

// Grid of metrics
export const MetricsGrid = ({ metrics }: { metrics: MetricCardProps[] }) => {
  return (
    <div className="metrics-grid">
      {metrics.map((metric, i) => (
        <MetricCard key={i} {...metric} />
      ))}
    </div>
  );
};
```

CSS for responsive grid:
```css
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  margin: 0.5rem 0;
}

.metric-change {
  font-size: 0.875rem;
  font-weight: 600;
}

.metric-change.up {
  color: var(--success-color);
}

.metric-change.down {
  color: var(--danger-color);
}
```

### Dashboard Page Structure

```typescript
export const DashboardPage = () => {
  return (
    <div className="dashboard-page">
      {/* Page header */}
      <div className="page-header">
        <h1>Dashboard</h1>
        <div className="page-actions">
          <button className="button button--secondary">
            Export
          </button>
          <button className="button button--primary">
            Add New
          </button>
        </div>
      </div>

      {/* Key metrics */}
      <MetricsGrid metrics={[
        { title: 'Total Revenue', value: '$45,231', change: { value: 12.5, direction: 'up' } },
        { title: 'Active Users', value: '2,345', change: { value: 3.2, direction: 'up' } },
        { title: 'Conversion Rate', value: '3.2%', change: { value: 0.5, direction: 'down' } },
        { title: 'Avg Order Value', value: '$125', change: { value: 8.1, direction: 'up' } },
      ]} />

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h2>Revenue Over Time</h2>
          <RevenueChart data={revenueData} />
        </div>
        <div className="chart-card">
          <h2>Traffic Sources</h2>
          <CategoryPieChart data={trafficData} />
        </div>
      </div>

      {/* Data table */}
      <div className="table-card">
        <div className="table-header">
          <h2>Recent Orders</h2>
          <input
            type="search"
            placeholder="Search orders..."
            className="search-input"
            aria-label="Search orders"
          />
        </div>
        <DataTable data={orders} />
      </div>
    </div>
  );
};
```

### Responsive Breakpoint Strategy

```typescript
// Breakpoint values
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// Media query hook
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
};

// Usage
const isMobile = useMediaQuery('(max-width: 768px)');
const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
const isDesktop = useMediaQuery('(min-width: 1025px)');

// Conditional rendering
{isMobile ? <MobileNav /> : <DesktopNav />}
```

Responsive patterns:
- **Mobile first**: Start with mobile styles, add complexity at larger breakpoints
- **Hide/show**: Hamburger menu on mobile, full nav on desktop
- **Stack/grid**: Stack cards vertically on mobile, grid on desktop
- **Truncate text**: Show full text on desktop, truncate on mobile
- **Collapsible sections**: Accordion on mobile, expanded on desktop

## Examples

### Example 1: Complete Dashboard with Sidebar

**Prompt:** "Create a dashboard with collapsible sidebar, metrics grid, revenue chart, and recent orders table"

**Expected Output:** Full dashboard layout with navigation, 4 metric cards, line chart, sortable/filterable data table, all responsive.

### Example 2: Data Table with All Features

**Prompt:** "Create a data table with sorting, filtering, pagination, and row selection"

**Expected Output:** Complete data table implementation with all hooks, accessible markup, and responsive styling.

### Example 3: Analytics Dashboard

**Prompt:** "Create an analytics dashboard with traffic metrics, conversion funnel chart, and top pages table"

**Expected Output:** Dashboard page with metric cards showing traffic stats, funnel visualization, and sortable table of pages.

## Quality Rules

1. **Sidebar must be collapsible on mobile** - Overlay pattern with backdrop
2. **Tables must be responsive** - Horizontal scroll or card layout on mobile
3. **Charts must use ResponsiveContainer** - Never fixed width/height
4. **All data must have loading state** - Skeleton loaders or spinners
5. **Empty states must be helpful** - "No data yet" with CTA to add first item
6. **Sorting must update aria-sort** - Screen reader announcement
7. **Pagination must be keyboard accessible** - Focus management
8. **Metrics must show trend direction** - Visual + accessible text
9. **Color-code data conditionally** - Red for negative, green for positive (with icons too)
10. **Test at 3 breakpoints minimum** - Mobile (375px), tablet (768px), desktop (1440px)
