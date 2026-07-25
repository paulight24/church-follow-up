import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';

interface ReportFiltersProps {
  onGenerate: (filters: {
    startDate: string;
    endDate: string;
    team: string;
    format: string;
  }) => void;
}

export function ReportFilters({ onGenerate }: ReportFiltersProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [team, setTeam] = useState('all');
  const [format, setFormat] = useState('pdf');

  function handleGenerate() {
    onGenerate({ startDate, endDate, team, format });
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Start Date
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          End Date
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
      </div>

      <Select
        label="Team"
        value={team}
        onChange={(e) => setTeam(e.target.value)}
        options={[
          { label: 'All Teams', value: 'all' },
          { label: 'Ushering', value: 'ushering' },
          { label: 'Follow-Up Team', value: 'follow-up' },
          { label: 'Choir', value: 'choir' },
          { label: 'Protocol', value: 'protocol' },
          { label: 'Media', value: 'media' },
        ]}
      />

      <Select
        label="Export Format"
        value={format}
        onChange={(e) => setFormat(e.target.value)}
        options={[
          { label: 'PDF', value: 'pdf' },
          { label: 'Excel (XLSX)', value: 'xlsx' },
          { label: 'CSV', value: 'csv' },
        ]}
      />

      <Button
        leftIcon={<Download className="h-4 w-4" />}
        onClick={handleGenerate}
      >
        Generate Report
      </Button>
    </div>
  );
}
