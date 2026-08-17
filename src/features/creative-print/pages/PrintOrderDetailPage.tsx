import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, CreditCard, Printer } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { usePermission } from '@/hooks/usePermission';
import { printApi } from '../api/creativePrint.api';
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
  const canManage = usePermission('print.order');

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['print-order', id],
    queryFn: () => printApi.getOrder(id!).then((res) => res.data),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: () => printApi.cancelOrder(id!),
    onSuccess: () => {
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
            {order.quantity.toLocaleString()} flyers · {PAPER_LABELS[order.paperPreset]} ·{' '}
            {URGENCY_LABELS[order.urgency]}
          </p>
        </div>
        <StatusBadge status={order.fulfillmentStatus} type="printOrder" />
      </div>

      {/* Payment and fulfilment are separate facts. An order can be paid and
          still have failed to reach the printer, so they are never merged
          into a single "status" for display. */}
      {order.paymentStatus === 'AWAITING' ? (
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
            <h2 className="font-semibold text-slate-900">What you are paying</h2>
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
          {canManage && CANCELLABLE.has(order.fulfillmentStatus) ? (
            <Button
              variant="danger"
              isLoading={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate()}
            >
              Cancel order
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
