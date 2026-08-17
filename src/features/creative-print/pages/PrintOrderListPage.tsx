import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Printer } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { printApi } from '../api/creativePrint.api';
import { formatMoney, PAPER_LABELS } from '../lib/format';

export function PrintOrderListPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['print-orders'],
    queryFn: () => printApi.getOrders({ pageSize: 100 }).then((res) => res.data),
  });

  const orders = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Print Orders"
        subtitle="Everything you have sent to a printer, and where each order stands"
      />

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" className="text-indigo-600" />
          </div>
        ) : isError ? (
          <p className="py-16 text-center text-sm text-rose-600">Could not load orders.</p>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={Printer}
            title="No print orders yet"
            description="Approve a flyer and you can order copies, or download the print-ready file and take it to any printer."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Paper</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      to={`/creative/orders/${order.id}`}
                      className="font-medium text-indigo-600 hover:underline"
                    >
                      {order.id.slice(0, 8).toUpperCase()}
                    </Link>
                    <span className="block text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>{order.quantity.toLocaleString()}</TableCell>
                  <TableCell>{PAPER_LABELS[order.paperPreset]}</TableCell>
                  <TableCell>{formatMoney(order.totalCents, order.currency)}</TableCell>
                  <TableCell>
                    {/* Fulfilment only. Payment is a separate column and
                        must never be shown as if it were the same thing. */}
                    <StatusBadge status={order.fulfillmentStatus} type="printOrder" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
