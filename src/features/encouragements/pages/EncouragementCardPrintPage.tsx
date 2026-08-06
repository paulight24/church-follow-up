import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Printer, ChevronLeft, Check, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/layout/PageHeader';
import { usePermission } from '@/hooks/usePermission';
import api from '@/config/api';

interface CardTemplate {
  id: string;
  title: string;
  scripture: string | null;
  encouragementText: string;
  pastorSignature: string | null;
  status: string;
}

function useCardTemplates() {
  return useQuery({
    queryKey: ['encouragement-card-templates'],
    queryFn: async () => {
      const res = await api.get('/encouragement-cards/templates', {
        params: { status: 'ACTIVE', pageSize: 50 },
      });
      const payload = res.data as { data: CardTemplate[] } | CardTemplate[];
      return Array.isArray(payload) ? payload : payload.data;
    },
  });
}

const CARDS_PER_PAGE = 24; // 4 columns x 6 rows

function PrintableCards({ templates }: { templates: CardTemplate[] }) {
  const pages: CardTemplate[][] = [];
  for (let i = 0; i < templates.length; i += CARDS_PER_PAGE) {
    pages.push(templates.slice(i, i + CARDS_PER_PAGE));
  }

  return (
    <div className="print-area">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          .print-page { page-break-after: always; break-after: page; }
          .print-page:last-child { page-break-after: auto; break-after: auto; }
          @page { size: A4; margin: 8mm; }
        }
      `}</style>
      {pages.map((pageCards, pi) => (
        <div
          key={pi}
          className="print-page mx-auto mb-8 grid grid-cols-4 gap-0"
          style={{ width: '194mm', minHeight: '271mm', alignContent: 'start' }}
        >
          {pageCards.map((card, ci) => (
            <div
              key={`${pi}-${ci}`}
              className="flex flex-col border border-dashed border-slate-300 px-1.5 py-1"
              style={{ width: '48.5mm' }}
            >
              <p className="mb-px text-center text-[6.5px] font-bold uppercase tracking-widest text-indigo-600">
                Christ Embassy LA
              </p>
              <div className="mx-auto mb-px h-px w-6 bg-indigo-200" />
              <h4 className="mb-px text-center text-[7.5px] font-semibold leading-tight text-slate-900">
                {card.title}
              </h4>
              <p className="text-center text-[7px] leading-snug text-slate-700">
                {card.encouragementText}
              </p>
              {card.scripture && (
                <p className="mt-px text-center text-[6.5px] font-medium italic text-indigo-500">
                  — {card.scripture}
                </p>
              )}
            </div>
          ))}
          {Array.from({ length: CARDS_PER_PAGE - pageCards.length }, (_, i) => (
            <div
              key={`empty-${i}`}
              className="border border-dashed border-slate-200"
              style={{ width: '48.5mm' }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function EncouragementCardPrintPage() {
  const { data: templates, isLoading } = useCardTemplates();
  // The route only requires encouragement_cards.print to reach this page;
  // /encouragements/cards/manage is separately gated on encouragement_cards.edit.
  const canManageTemplates = usePermission('encouragement_cards.edit');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showPreview, setShowPreview] = useState(false);

  const activeTemplates = templates ?? [];
  const selectedTemplates = selected.size > 0
    ? activeTemplates.filter((t) => selected.has(t.id))
    : activeTemplates;

  const cardsForPrint: CardTemplate[] = [];
  if (selectedTemplates.length > 0) {
    const copies = Math.max(1, Math.ceil(CARDS_PER_PAGE / selectedTemplates.length));
    for (let c = 0; c < copies; c++) {
      cardsForPrint.push(...selectedTemplates);
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  if (showPreview) {
    return (
      <div>
        <div className="no-print mb-4 flex items-center justify-between px-4 py-3">
          <Button variant="outline" size="sm" onClick={() => setShowPreview(false)}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">
              {cardsForPrint.length} cards across {Math.ceil(cardsForPrint.length / CARDS_PER_PAGE)} page(s)
            </span>
            <Button size="sm" onClick={() => window.print()}>
              <Printer className="mr-1.5 h-4 w-4" /> Print
            </Button>
          </div>
        </div>
        <PrintableCards templates={cardsForPrint} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Encouragement Cards"
        description="Select templates and print encouragement cards for ushers to hand out"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/encouragements">
              <Button variant="outline" size="sm">
                <ChevronLeft className="mr-1 h-4 w-4" /> Encouragements
              </Button>
            </Link>
            {canManageTemplates && (
              <Link to="/encouragements/cards/manage">
                <Button variant="outline" size="sm">
                  <Settings className="mr-1 h-4 w-4" /> Manage Templates
                </Button>
              </Link>
            )}
            <Button
              size="sm"
              disabled={activeTemplates.length === 0}
              onClick={() => setShowPreview(true)}
            >
              <Printer className="mr-1.5 h-4 w-4" />
              Preview &amp; Print ({selected.size || activeTemplates.length} cards)
            </Button>
          </div>
        }
      />

      {activeTemplates.length === 0 ? (
        <Card>
          <div className="p-8 text-center text-sm text-slate-500">
            No active card templates found. Create templates in the admin panel first.
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {activeTemplates.map((t) => {
            const isSelected = selected.has(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleSelect(t.id)}
                className={`relative rounded-xl border-2 p-5 text-left transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                {isSelected && (
                  <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
                <h3 className="mb-2 text-sm font-semibold text-slate-900">{t.title}</h3>
                <p className="mb-2 text-xs leading-relaxed text-slate-600 line-clamp-3">
                  {t.encouragementText}
                </p>
                {t.scripture && (
                  <p className="text-xs font-medium italic text-indigo-500">— {t.scripture}</p>
                )}
                {t.pastorSignature && (
                  <p className="mt-1 text-[10px] text-slate-400">{t.pastorSignature}</p>
                )}
              </button>
            );
          })}
        </div>
      )}

      {selected.size > 0 && (
        <p className="text-center text-sm text-slate-500">
          {selected.size} template(s) selected. Click &quot;Preview &amp; Print&quot; to generate cards, or click a card again to deselect.
        </p>
      )}
      {selected.size === 0 && activeTemplates.length > 0 && (
        <p className="text-center text-sm text-slate-500">
          All {activeTemplates.length} templates will be included. Click individual cards to select specific ones.
        </p>
      )}
    </div>
  );
}
