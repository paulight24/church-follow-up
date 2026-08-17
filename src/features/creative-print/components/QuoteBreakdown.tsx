import { Info } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { formatMoney } from '../lib/format';
import type { PrintQuote } from '@/types/creativePrint';

/**
 * The price, itemised.
 *
 * The product promise is that a church sees exactly what it is paying for —
 * printing, any rush surcharge, delivery, tax, and our service fee as its
 * own line. No margin hidden inside a subtotal. The server guarantees these
 * lines sum to the total, so they are rendered as given.
 */
export function QuoteBreakdown({ quote }: { quote: PrintQuote }) {
  return (
    <div className="space-y-3">
      {quote.isMock ? (
        <Alert variant="warning" title="Sample pricing">
          No printer is connected yet, so these are realistic sample figures — not a real quote.
          Nothing will be charged.
        </Alert>
      ) : null}

      <div className="rounded-lg border border-slate-200">
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="font-medium text-slate-900">
            {quote.quantity.toLocaleString()} flyers
          </p>
          <p className="text-sm text-slate-500">
            {quote.fulfillmentType === 'PICKUP' ? 'Collected locally' : 'Delivered'}
          </p>
        </div>

        <dl className="divide-y divide-slate-100">
          {quote.lineItems.map((item) => (
            <div key={item.label} className="flex justify-between px-4 py-2 text-sm">
              <dt className="text-slate-600">{item.label}</dt>
              <dd className="font-medium text-slate-900">
                {formatMoney(item.amountCents, quote.currency)}
              </dd>
            </div>
          ))}
          <div className="flex justify-between bg-slate-50 px-4 py-3">
            <dt className="font-semibold text-slate-900">Total</dt>
            <dd className="font-semibold text-slate-900">
              {formatMoney(quote.totalCents, quote.currency)}
            </dd>
          </div>
        </dl>
      </div>

      {!quote.taxIsFinal && quote.estimatedTaxCents !== null ? (
        <p className="flex items-start gap-1.5 text-sm text-slate-500">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          Tax is an estimate until the printer confirms it — the final amount may differ slightly.
        </p>
      ) : null}

      {quote.estimatedReadyAt ? (
        <p className="text-sm text-slate-600">
          Ready around{' '}
          <span className="font-medium text-slate-900">
            {new Date(quote.estimatedReadyAt).toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          {quote.estimatedDeliveryAt
            ? `, arriving about ${new Date(quote.estimatedDeliveryAt).toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}`
            : ''}
          .
        </p>
      ) : null}
    </div>
  );
}
