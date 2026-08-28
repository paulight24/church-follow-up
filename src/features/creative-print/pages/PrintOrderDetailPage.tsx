import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, ChevronRight, CreditCard, Download, FileText, Printer } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { usePermission } from '@/hooks/usePermission';
import { downloadPrintDocument, printApi } from '../api/creativePrint.api';
import { FULFILLMENT_LABELS } from '../lib/orderConfig';
import { formatMoney, ORDER_STATUS_LABELS, PAPER_LABELS, URGENCY_LABELS } from '../lib/format';

const CANCELLABLE = new Set([
  'DRAFT',
  'QUOTED',
  'AWAITING_PAYMENT',
  'PAID',
  'SUBMITTED',
  'ACCEPTED',
]);

export function PrintOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  // The route accepts either permission; checking only print.order hid the
  // button from administrators who hold print.manage and nothing else.
  const canOrder = usePermission('print.order');
  const canManageOrders = usePermission('print.manage');
  const canCancel = canOrder || canManageOrders;
  const canDownload = usePermission('print.download');
  const justPlaced = searchParams.get('placed') === '1';

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['print-order', id],
    queryFn: () => printApi.getOrder(id!).then((res) => res.data),
    enabled: !!id,
  });

  // The order names a print file; the file names the flyer. Without this
  // hop an order is a bare id with no route back to what it prints.
  const { data: document } = useQuery({
    queryKey: ['print-document', order?.printDocumentId],
    queryFn: () => printApi.getDocument(order!.printDocumentId).then((res) => res.data),
    enabled: !!order?.printDocumentId,
  });

  const cancelMutation = useMutation({
    mutationFn: () => printApi.cancelOrder(id!),
    onSuccess: () => {
      setConfirmingCancel(false);
      toast({ title: 'Order cancelled', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['print-order', id] });
      queryClient.invalidateQueries({ queryKey: ['print-orders'] });
    },
    onError: (err: unknown) =>
      toast({
        title: 'Could not cancel',
        description:
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Please try again.',
        variant: 'error',
      }),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }
  if (isError || !order) return <Alert variant="error">Could not load this order.</Alert>;

  const money: [string, number | null][] = [
    ['Printing', order.subtotalCents],
    ['Production', order.productionFeeCents],
    ['Delivery', order.shippingCents],
    ['Tax', order.taxCents],
    ['MemberCare service fee', order.serviceFeeCents],
  ];

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-slate-500">
        <Link to="/creative/orders" className="hover:text-indigo-600">
          Print Orders
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-slate-900">{order.id.slice(0, 8).toUpperCase()}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Order {order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {order.quantity.toLocaleString()} flyers · {PAPER_LABELS[order.paperPreset]} paper ·{' '}
            {order.sides === 'DOUBLE' ? 'Double-sided' : 'Single-sided'} ·{' '}
            {FULFILLMENT_LABELS[order.fulfillmentType]} ·{' '}
            {URGENCY_LABELS[order.urgency]} turnaround
          </p>
        </div>
        <StatusBadge status={order.fulfillmentStatus} type="printOrder" />
      </div>

      {justPlaced ? (
        <Alert variant="success" title="Order recorded">
          Nothing has been charged and nothing has been sent to a printer yet — this order is
          waiting for payment to be set up. You can cancel it any time until then. Your print-ready
          PDF is ready to download now if you need the flyers sooner.
        </Alert>
      ) : null}

      {/* PrintOrder carries no isMock flag, so sample-ness is derived from
          the adapter that priced it. Sample figures must never read as a
          real printer's price, on any screen that shows them. */}
      {order.provider === 'mock' ? (
        <Alert variant="warning" title="Sample pricing">
          No printer is connected yet, so these are realistic sample figures — not a real quote.
          Nothing will be charged.
        </Alert>
      ) : null}

      {/* Payment and fulfilment are separate facts. An order can be paid and
          still have failed to reach the printer, so they are never merged
          into a single "status" for display. */}
      {order.paymentStatus === 'AWAITING' && !justPlaced ? (
        <Alert variant="info" title="Payment is not enabled yet">
          This order is recorded but nothing has been charged and nothing has been sent to a
          printer. Card payment is still to be set up.
        </Alert>
      ) : null}

      {order.failureReason ? (
        <Alert variant="error" title="This order failed">
          {order.failureReason}
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 py-5">
            <h2 className="font-semibold text-slate-900">
              {order.paymentStatus === 'AWAITING' ? 'What this will cost' : 'What you paid'}
            </h2>
            <dl className="divide-y divide-slate-100">
              {money.map(([label, cents]) =>
                cents === null ? null : (
                  <div key={label} className="flex justify-between py-2 text-sm">
                    <dt className="text-slate-600">{label}</dt>
                    <dd className="font-medium text-slate-900">
                      {formatMoney(cents, order.currency)}
                    </dd>
                  </div>
                )
              )}
              <div className="flex justify-between pt-3">
                <dt className="font-semibold text-slate-900">Total</dt>
                <dd className="font-semibold text-slate-900">
                  {formatMoney(order.totalCents, order.currency)}
                </dd>
              </div>
            </dl>
            <p className="flex items-center gap-1.5 text-sm text-slate-500">
              <CreditCard className="h-4 w-4" />
              Payment: {order.paymentStatus.toLowerCase().replace(/_/g, ' ')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 py-5">
            <h2 className="font-semibold text-slate-900">Progress</h2>
            {order.events.length === 0 ? (
              <p className="text-sm text-slate-500">Nothing has happened yet.</p>
            ) : (
              <ol className="space-y-3">
                {order.events.map((event) => (
                  <li key={event.id} className="flex gap-3">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {event.toStatus
                          ? (ORDER_STATUS_LABELS[
                              event.toStatus as keyof typeof ORDER_STATUS_LABELS
                            ] ?? event.toStatus)
                          : event.eventType}
                      </p>
                      {typeof event.detail?.reason === 'string' ? (
                        <p className="text-sm text-slate-600">{event.detail.reason}</p>
                      ) : null}
                      <p className="text-xs text-slate-500">
                        {new Date(event.createdAt).toLocaleString()}
                        {event.source !== 'SYSTEM' ? ` · ${event.source.toLowerCase()}` : ''}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm text-slate-600">
            <Printer className="h-4 w-4 text-slate-400" />
            Printed by {order.provider === 'mock' ? 'a sample printer' : order.provider}
            {order.providerOrderId ? ` · ref ${order.providerOrderId}` : ''}
          </p>
          <div className="flex flex-wrap gap-2">
            {document ? (
              <Link
                to={`/creative/${document.flyerId}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <FileText className="h-4 w-4" />
                See the flyer
              </Link>
            ) : null}
            {document && canDownload ? (
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() => downloadPrintDocument(document.id, `print-order-${order.id.slice(0, 8)}.pdf`)}
              >
                Download the print file
              </Button>
            ) : null}
            {canCancel && CANCELLABLE.has(order.fulfillmentStatus) ? (
              <Button variant="danger" size="sm" onClick={() => setConfirmingCancel(true)}>
                Cancel order
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Cancelling cannot be undone and is one tap away on a phone. */}
      <ConfirmDialog
        isOpen={confirmingCancel}
        onClose={() => setConfirmingCancel(false)}
        onConfirm={() => cancelMutation.mutate()}
        title="Cancel this print order?"
        message="The order is withdrawn and nothing will be printed. You can always place a new one — the price will be quoted again."
        confirmText={cancelMutation.isPending ? 'Cancelling…' : 'Cancel order'}
        cancelText="Keep the order"
        variant="danger"
      />

      {!CANCELLABLE.has(order.fulfillmentStatus) && order.fulfillmentStatus !== 'CANCELLED' ? (
        <p className="flex items-start gap-1.5 text-sm text-slate-500">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          This order has reached the printer, so it can no longer be cancelled here. Contact the
          printer directly.
        </p>
      ) : null}
    </div>
  );
}
