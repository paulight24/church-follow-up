import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Upload,
  Columns3,
  Eye,
  CheckCircle,
  Check,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/ui/FileUpload';
import { EmptyState } from '@/components/ui/EmptyState';
import { Alert } from '@/components/ui/Alert';
import { cn } from '@/lib/cn';

const STEPS = [
  { id: 1, label: 'Upload File', icon: Upload },
  { id: 2, label: 'Map Columns', icon: Columns3 },
  { id: 3, label: 'Preview', icon: Eye },
  { id: 4, label: 'Results', icon: CheckCircle },
] as const;

export function MemberImportPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

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
                className={cn(
                  'relative flex items-center',
                  index < STEPS.length - 1 && 'flex-1',
                )}
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
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
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
                Upload a CSV or XLSX file containing member data. The file
                should include columns for first name, last name, and at least
                one contact method (email or phone).
              </Alert>

              <FileUpload
                accept=".csv,.xlsx,.xls"
                onFileSelect={handleFileSelect}
                label="Select file to import"
                helpText="Supported formats: CSV, XLSX. Maximum 5MB."
              />

              {selectedFile && (
                <div className="mt-6 flex justify-end">
                  <Button onClick={handleNextStep}>
                    Continue to Column Mapping
                  </Button>
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
            <EmptyState
              icon={<Columns3 className="h-12 w-12" />}
              title="Coming Soon"
              description="Column mapping functionality will be available in a future update. This step will let you map columns from your file to member fields."
              action={
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Back
                  </Button>
                  <Button onClick={handleNextStep}>Skip to Preview</Button>
                </div>
              }
            />
          </CardContent>
        )}

        {currentStep === 3 && (
          <CardContent>
            <CardHeader className="px-0">
              <CardTitle>Preview Import Data</CardTitle>
            </CardHeader>
            <EmptyState
              icon={<Eye className="h-12 w-12" />}
              title="Coming Soon"
              description="Data preview functionality will be available in a future update. This step will show a preview of the parsed data before importing."
              action={
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Back
                  </Button>
                  <Button onClick={handleNextStep}>Skip to Results</Button>
                </div>
              }
            />
          </CardContent>
        )}

        {currentStep === 4 && (
          <CardContent>
            <CardHeader className="px-0">
              <CardTitle>Import Results</CardTitle>
            </CardHeader>
            <EmptyState
              icon={<CheckCircle className="h-12 w-12" />}
              title="Coming Soon"
              description="Import results will be displayed here showing success and error counts after the import completes."
              action={
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Start Over
                  </Button>
                  <Link to="/members">
                    <Button>View Members</Button>
                  </Link>
                </div>
              }
            />
          </CardContent>
        )}
      </Card>
    </div>
  );
}
