import { useMemo, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import {
  ChevronRight,
  Upload,
  Columns3,
  Eye,
  CheckCircle,
  Check,
  XCircle,
  Download,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/ui/FileUpload';
import { EmptyState } from '@/components/ui/EmptyState';
import { Alert } from '@/components/ui/Alert';
import { Select } from '@/components/ui/Select';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/cn';
import { membersApi } from '@/features/members/api/members.api';
import type { ImportRecord } from '@/types/member';
import type { ApiError } from '@/types';

type ParsedRow = Record<string, string>;

const STEPS = [
  { id: 1, label: 'Upload File', icon: Upload },
  { id: 2, label: 'Map Columns', icon: Columns3 },
  { id: 3, label: 'Preview', icon: Eye },
  { id: 4, label: 'Results', icon: CheckCircle },
] as const;

// Fields the backend's import row-mapper understands (members.service.ts importMembers()).
const TARGET_FIELDS = [
  { label: 'Do not import', value: '' },
  { label: 'First Name *', value: 'firstName' },
  { label: 'Last Name *', value: 'lastName' },
  { label: 'Middle Name', value: 'middleName' },
  { label: 'Preferred Name', value: 'preferredName' },
  { label: 'Primary Phone', value: 'phonePrimary' },
  { label: 'Secondary Phone', value: 'phoneSecondary' },
  { label: 'Email', value: 'email' },
  { label: 'Birthday (M/D or MM/DD/YYYY)', value: 'dateOfBirth' },
  { label: 'Wedding Anniversary (M/D or MM/DD/YYYY)', value: 'weddingAnniversary' },
  { label: 'Gender', value: 'gender' },
  { label: 'Marital Status', value: 'maritalStatus' },
  { label: 'Membership Status (name)', value: 'membershipStatus' },
  { label: 'Department (name)', value: 'department' },
  { label: 'Cell Group (name)', value: 'fellowshipGroup' },
  { label: 'Last Attendance Date', value: 'lastAttendanceDate' },
  { label: 'Preferred Contact Method', value: 'preferredContactMethod' },
  { label: 'Preferred Language', value: 'preferredLanguage' },
  { label: 'Is First Timer (true/false)', value: 'isFirstTimer' },
  { label: 'First Visit Date', value: 'firstVisitDate' },
  { label: 'Born Again Status', value: 'bornAgainStatus' },
  { label: 'Invited By (Name)', value: 'inviterName' },
  { label: 'Inviter Phone', value: 'inviterPhone' },
  { label: 'Email Consent (true/false)', value: 'emailConsent' },
  { label: 'SMS Consent (true/false)', value: 'smsConsent' },
  { label: 'Do Not Contact (true/false)', value: 'doNotContact' },
  { label: 'General Notes', value: 'generalNotes' },
];

// Common spreadsheet column names that don't match the field key directly.
const HEADER_ALIASES: Record<string, string> = {
  birthday: 'dateOfBirth',
  dob: 'dateOfBirth',
  dateofbirth: 'dateOfBirth',
  birthdate: 'dateOfBirth',
  weddinganniversary: 'weddingAnniversary',
  anniversary: 'weddingAnniversary',
  marriagedate: 'weddingAnniversary',
  weddingdate: 'weddingAnniversary',
  phone: 'phonePrimary',
  phonenumber: 'phonePrimary',
  mobile: 'phonePrimary',
  mobilenumber: 'phonePrimary',
  cellphone: 'phonePrimary',
  firsttimer: 'isFirstTimer',
  isfirsttimer: 'isFirstTimer',
  firstvisit: 'firstVisitDate',
  firstvisitdate: 'firstVisitDate',
  bornagain: 'bornAgainStatus',
  bornagainstatus: 'bornAgainStatus',
  invitedby: 'inviterName',
  invitername: 'inviterName',
  inviterphone: 'inviterPhone',
};

function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function guessDefaultMapping(headers: string[]): Record<string, string> {
  const byNormalized = new Map(TARGET_FIELDS.filter((f) => f.value).map((f) => [normalizeHeader(f.value), f.value]));
  const mapping: Record<string, string> = {};
  for (const header of headers) {
    const norm = normalizeHeader(header);
    const match = byNormalized.get(norm) ?? HEADER_ALIASES[norm];
    if (match) mapping[header] = match;
  }
  return mapping;
}

function applyMapping(row: ParsedRow, mapping: Record<string, string>): ParsedRow {
  const mapped: ParsedRow = {};
  for (const [sourceColumn, targetField] of Object.entries(mapping)) {
    if (!targetField) continue;
    mapped[targetField] = row[sourceColumn] ?? '';
  }
  return mapped;
}

const SAMPLE_ROWS = [
  ['John', 'Doe', '', '', '+2348012345678', '', 'john@example.com', '6/15', '', 'Male', 'Single', 'Visitor', '', '', '', 'PHONE', 'en', 'false', '', '', '', '', 'true', 'true', 'false', ''],
  ['Jane', 'Smith', 'Ann', 'Jenny', '+2349087654321', '+2349011111111', 'jane@example.com', '3/22/1990', '8/14/2015', 'Female', 'Married', 'Member', 'Ushering', 'Zone A', '2026-07-20', 'EMAIL', 'en', 'false', '', 'YES', 'Pastor Bola', '+2349022222222', 'true', 'true', 'false', 'First-time visitor from Zone A'],
  ['David', 'Ola', '', '', '+2347033333333', '', '', '11/5', '', 'Male', '', '', '', '', '', 'PHONE', 'en', 'true', '2026-01-15', 'YES', '', '', 'true', 'false', 'false', ''],
];

function downloadSampleTemplate() {
  const headers = TARGET_FIELDS.filter((f) => f.value).map((f) => f.value);
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headers, ...SAMPLE_ROWS]);
  XLSX.utils.book_append_sheet(wb, ws, 'Members');
  XLSX.writeFile(wb, 'member-import-template.xlsx');
}

export function MemberImportPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importResult, setImportResult] = useState<ImportRecord | null>(null);

  const importMutation = useMutation({
    mutationFn: () =>
      membersApi.importMembers({
        filename: selectedFile?.name ?? 'import.csv',
        mapping,
        rows,
      }),
    onSuccess: async (res) => {
      // The create response omits the row-level error list; fetch the full record for it.
      const full = await membersApi.getImport(res.data.id).then((r) => r.data).catch(() => res.data);
      setImportResult(full);
      setCurrentStep(4);
    },
  });

  const previewRows = useMemo(
    () => rows.slice(0, 10).map((row) => applyMapping(row, mapping)),
    [rows, mapping],
  );

  const mappedTargetColumns = useMemo(
    () => Array.from(new Set(Object.values(mapping).filter(Boolean))),
    [mapping],
  );

  const hasRequiredFields =
    Object.values(mapping).includes('firstName') && Object.values(mapping).includes('lastName');

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setParseError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        if (!data) throw new Error('Could not read file');
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) throw new Error('The file has no sheets');
        const sheet = workbook.Sheets[firstSheetName];
        const parsed = XLSX.utils.sheet_to_json<ParsedRow>(sheet, { defval: '', raw: false });

        if (parsed.length === 0) {
          setParseError('No data rows were found in this file.');
          return;
        }

        const detectedHeaders = Object.keys(parsed[0]);
        setHeaders(detectedHeaders);
        setRows(parsed);
        setMapping(guessDefaultMapping(detectedHeaders));
      } catch (err) {
        setParseError(err instanceof Error ? err.message : 'Failed to parse file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleMappingChange = (header: string, targetField: string) => {
    setMapping((prev) => ({ ...prev, [header]: targetField }));
  };

  const handleStartOver = () => {
    setCurrentStep(1);
    setSelectedFile(null);
    setHeaders([]);
    setRows([]);
    setMapping({});
    setImportResult(null);
    setParseError(null);
    importMutation.reset();
  };

  const importErrorMessage = (importMutation.error as { response?: { data?: ApiError } } | undefined)
    ?.response?.data?.message;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500">
        <Link to="/members" className="hover:text-indigo-600">
          Members
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-slate-900">Import</span>
      </nav>

      <PageHeader
        title="Import Members"
        description="Upload a CSV or Excel file to bulk import church members."
      />

      {/* Step Indicator */}
      <nav aria-label="Progress">
        <ol className="flex items-center">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <li
                key={step.id}
                className={cn('relative flex items-center', index < STEPS.length - 1 && 'flex-1')}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
                      isCompleted
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : isCurrent
                          ? 'border-indigo-600 bg-white text-indigo-600'
                          : 'border-slate-300 bg-white text-slate-500',
                    )}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                  </span>
                  <span
                    className={cn(
                      'hidden text-sm font-medium sm:block',
                      isCurrent ? 'text-indigo-600' : 'text-slate-500',
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'mx-4 hidden h-0.5 flex-1 sm:block',
                      isCompleted ? 'bg-indigo-600' : 'bg-slate-200',
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Step Content */}
      <Card>
        {currentStep === 1 && (
          <CardContent className="space-y-6 py-8">
            <div className="mx-auto max-w-lg">
              <Alert variant="info" className="mb-6">
                Upload a CSV or XLSX file containing member data. The first row must contain column
                headers. You will map columns to member fields in the next step.
              </Alert>

              <div className="mb-6 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                <Download className="h-4 w-4 shrink-0 text-indigo-500" />
                <span>Need a starting point?</span>
                <button
                  type="button"
                  onClick={downloadSampleTemplate}
                  className="font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-700"
                >
                  Download sample template
                </button>
                <span>with example data and all supported columns.</span>
              </div>

              {parseError && (
                <Alert variant="error" className="mb-6">
                  {parseError}
                </Alert>
              )}

              <FileUpload
                accept=".csv,.xlsx,.xls"
                onFileSelect={handleFileSelect}
                label="Select file to import"
                helpText="Supported formats: CSV, XLSX. Maximum 5MB."
              />

              {selectedFile && rows.length > 0 && (
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    Parsed {rows.length} row{rows.length !== 1 ? 's' : ''} with {headers.length} column
                    {headers.length !== 1 ? 's' : ''}.
                  </p>
                  <Button onClick={() => setCurrentStep(2)}>Continue to Column Mapping</Button>
                </div>
              )}
            </div>
          </CardContent>
        )}

        {currentStep === 2 && (
          <CardContent>
            <CardHeader className="px-0">
              <CardTitle>Map Columns</CardTitle>
            </CardHeader>
            <p className="mb-4 text-sm text-slate-500">
              Match each column from your file to a member field. First Name and Last Name are
              required.
            </p>
            <div className="space-y-3">
              {headers.map((header) => (
                <div
                  key={header}
                  className="flex flex-col gap-2 rounded-lg border border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-sm font-medium text-slate-700">{header}</span>
                  <div className="w-full sm:w-64">
                    <Select
                      options={TARGET_FIELDS}
                      value={mapping[header] ?? ''}
                      onChange={(e) => handleMappingChange(header, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
            {!hasRequiredFields && (
              <Alert variant="warning" className="mt-4">
                Map a column to both First Name and Last Name before continuing.
              </Alert>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button onClick={() => setCurrentStep(3)} disabled={!hasRequiredFields}>
                Continue to Preview
              </Button>
            </div>
          </CardContent>
        )}

        {currentStep === 3 && (
          <CardContent>
            <CardHeader className="px-0">
              <CardTitle>Preview Import Data</CardTitle>
            </CardHeader>
            <p className="mb-4 text-sm text-slate-500">
              Showing the first {previewRows.length} of {rows.length} row(s) as they will be
              imported.
            </p>
            {importMutation.isError && (
              <Alert variant="error" className="mb-4">
                {importErrorMessage ?? 'Import failed. Please try again.'}
              </Alert>
            )}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {mappedTargetColumns.map((col) => (
                      <TableHead key={col}>{col}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.map((row, i) => (
                    <TableRow key={i}>
                      {mappedTargetColumns.map((col) => (
                        <TableCell key={col}>{row[col] || '--'}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                Back
              </Button>
              <Button
                onClick={() => importMutation.mutate()}
                isLoading={importMutation.isPending}
                leftIcon={importMutation.isPending ? undefined : <Upload className="h-4 w-4" />}
              >
                Start Import
              </Button>
            </div>
          </CardContent>
        )}

        {currentStep === 4 && (
          <CardContent>
            <CardHeader className="px-0">
              <CardTitle>Import Results</CardTitle>
            </CardHeader>
            {importMutation.isPending || !importResult ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" className="text-indigo-600" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-center">
                    <p className="text-2xl font-bold text-slate-900">{importResult.totalRows}</p>
                    <p className="text-sm text-slate-500">Total Rows</p>
                  </div>
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-700">{importResult.successfulRows}</p>
                    <p className="text-sm text-emerald-600">Imported</p>
                  </div>
                  <div className="rounded-lg border border-rose-100 bg-rose-50 p-4 text-center">
                    <p className="text-2xl font-bold text-rose-700">{importResult.failedRows}</p>
                    <p className="text-sm text-rose-600">Failed</p>
                  </div>
                </div>

                {importResult.errors && importResult.errors.length > 0 && (
                  <div>
                    <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                      <XCircle className="h-4 w-4 text-rose-500" />
                      Row Errors
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Row</TableHead>
                          <TableHead>Error</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importResult.errors.map((err) => (
                          <TableRow key={err.id}>
                            <TableCell>{err.rowNumber}</TableCell>
                            <TableCell>{err.errorMessage}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {importResult.successfulRows === 0 && importResult.failedRows === 0 && (
                  <EmptyState
                    icon={CheckCircle}
                    title="Nothing was imported"
                    description="The file did not contain any importable rows."
                  />
                )}

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={handleStartOver}>
                    Start Over
                  </Button>
                  <Button onClick={() => navigate('/members')}>View Members</Button>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
