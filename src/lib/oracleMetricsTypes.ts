// 🔮 Oracle Metrics Types - Interfaces for Oracle Metrics System
// Extracted from deleted OracleMetricsSystem component

export interface MetricData {
  id: string;
  name?: string;
  label?: string;
  value: number | string;
  unit?: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description?: string;
  details?: {
    description: string;
    lastUpdate: Date;
    current?: number | string;
    previous?: number | string;
    change?: number;
    breakdown?: Array<{
      label: string;
      value: number | string;
      percentage: number;
    }>;
  };
}

export interface MetricCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  metrics: MetricData[];
  status: 'active' | 'warning' | 'critical';
} 