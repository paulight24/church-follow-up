import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

const teamData = [
  { name: 'Outreach', completion: 92 },
  { name: 'Pastoral', completion: 85 },
  { name: 'New Members', completion: 78 },
  { name: 'Youth', completion: 71 },
  { name: 'Prayer', completion: 88 },
  { name: 'Visitation', completion: 64 },
];

export function TeamCompletionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Completion Rates</CardTitle>
        <CardDescription>Follow-up task completion by team this month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={teamData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(value: number) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '13px',
                }}
                formatter={(value: number) => [`${value}%`, 'Completion']}
                cursor={{ fill: 'rgba(99, 102, 241, 0.06)' }}
              />
              <Bar
                dataKey="completion"
                fill="#6366f1"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
