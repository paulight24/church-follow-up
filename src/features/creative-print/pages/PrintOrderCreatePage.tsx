import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Info, RefreshCw } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { creativeApi, downloadPrintDocument, printApi } from '../api/creativePrint.api';
import { QuoteBreakdown } from '../components/QuoteBreakdown';
import { PrintAdvisorBanner } from '../components/PrintAdvisorBanner';
import { PrintOptionsForm } from '../components/PrintOptionsForm';
import { DeliveryAddressFields } from '../components/DeliveryAddressFields';
import { usePrintOrderDraft } from '../hooks/usePrintOrderDraft';
import {
  activeCapabilities,
  clampQuantity,
  deriveSides,
  formatQuoteExpiry,
  orderFormSchema,
  toShippingAddress,
  type OrderFormValues,
  type PricedConfig,
} from '../lib/orderConfig';
import { formatInches, formatMoney } from '../lib/format';
import type { PaperPreset, Urgency } from '@/types/creativePrint';

/**
 * Ordering prints: one page, one scroll.
 *
 * Not a wizard, deliberately. There are four decisions and a wizard would
 * hide the total until the last step, which is the opposite of what this
 * module promises. A volunteer on a phone at 11pm gets a URL that survives
 * a refresh, every choice visible at once, and a price that vanishes the
 * moment it stops describing what they are about to order.
 */
export function PrintOrderCreatePage() {
  const { id: flyerId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const documentId = searchParams.get('documentId');

  const { data: flyer, isLoading: flyerLoading } = useQuery({
    queryKey: ['flyer', flyerId],
    queryFn: () => creativeApi.getFlyer(flyerId!).then((res) => res.data),
    enabled: !!flyerId,
  });

  const { data: document, isLoading: documentLoading, isError: documentError } = useQuery({
    queryKey: ['print-document', documentId],
    queryFn: () => printApi.getDocument(documentId!).then((res) => res.data),
    enabled: !!documentId,
  });

  // The advisor names the ACTIVE provider; capabilities lists every adapter,
  // connected or not. Joining them is the only way the form is built against
  // the printer that will actually take the order.
  const { data: advice } = useQuery({
    queryKey: ['print-advice', flyer?.event?.eventDate ?? null],
    queryFn: () =>
      printApi
        .getAdvice(flyer?.event?.eventDate ? { eventDate: flyer.event.eventDate } : {})
        .then((res) => res.data),
    enabled: !!flyer,
  });

  const { data: allCapabilities } = useQuery({
    queryKey: ['print-capabilities'],
    queryFn: () => printApi.getCapabilities().then((res) => res.data),
  });

  const { data: paperOptions } = useQuery({
    queryKey: ['print-paper-options'],
    queryFn: () => printApi.getPaperOptions().then((res) => res.data),
  });

  const capabilities = useMemo(
    () => activeCapabilities(allCapabilities, advice?.provider),
    [allCapabilities, advice?.provider]
  );

  const [quantity, setQuantity] = useState<number | null>(null);
  const [paperPreset, setPaperPreset] = useState<PaperPreset | null>(null);
  const [urgency, setUrgency] = useState<Urgency | null>(null);

  // Defaults come from the provider and the deadline, once both are known.
  useEffect(() => {
    if (capabilities && quantity === null) setQuantity(clampQuantity(250, capabilities));
  }, [capabilities, quantity]);
  useEffect(() => {
    if (paperOptions?.length && paperPreset === null) {
      setPaperPreset((paperOptions.find((option) => option.recommended) ?? paperOptions[0]).preset);
    }
  }, [paperOptions, paperPreset]);
  useEffect(() => {
    if (advice && urgency === null) setUrgency(advice.recommendedUrgency);
  }, [advice, urgency]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      address: { name: '', line1: '', city: '', stateOrProvince: '', postalCode: '', country: 'US' },
    },
  });

  const address = watch('address');

  const pricedConfig: PricedConfig | null =
    document && quantity && paperPreset && urgency
      ? {
          printDocumentId: document.id,
          quantity,
          paperPreset,
          sides: deriveSides(document),
          // Pickup is not offered: the backend accepts a pickup location and
          // persists it nowhere, so a church would choose a store that has no
          // record of the order. Delivery only until that is real.
          fulfillmentType: 'DELIVERY',
          urgency,
          postalCode: address.postalCode ?? '',
          stateOrProvince: address.stateOrProvince ?? '',
          country: address.country ?? '',
        }
      : null;

  const { quote, quoteState, error, isPlacing, requestQuote, placeOrder } =
    usePrintOrderDraft(pricedConfig);

  const destinationReady =
    (address.postalCode ?? '').trim().length >= 3 &&
    (address.stateOrProvince ?? '').trim().length >= 2 &&
    (address.country ?? '').trim().length === 2;

  if (flyerLoading || (documentId && documentLoading)) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }
  if (!flyer) return <Alert variant="error">Could not load this flyer.</Alert>;

  if (!documentId || documentError || !document) {
    return (
      <div className="space-y-4">
        <Breadcrumb flyerId={flyer.id} flyerTitle={flyer.title} />
        <Alert variant="warning" title="Build the print file first">
          An order is placed against a specific print-ready file, so a printer receives exactly what
          you approved. Build it on the flyer page, then come back.
        </Alert>
        <Button onClick={() => navigate(`/creative/${flyer.id}`)}>Back to the flyer</Button>
      </div>
    );
  }

  // `values`, not the watched form state: only the parsed output has the
  // transforms applied — blank optional fields dropped, country upper-cased.
  // Sending the raw state means posting `email: ''`, which the server's own
  // schema rejects as an invalid address.
  const onSubmit = handleSubmit((values) => {
    placeOrder(toShippingAddress(values.address), (order) =>
      navigate(`/creative/orders/${order.id}?placed=1`)
    );
  });

  return (
    <div className="space-y-6 pb-28">
      <Breadcrumb flyerId={flyer.id} flyerTitle={flyer.title} />

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Order prints</h1>
        <p className="mt-1 text-sm text-slate-500">{flyer.title}</p>
      </div>

      {advice ? (
        <PrintAdvisorBanner
          advice={advice}
          eventName={flyer.event?.name ?? null}
          onDownload={() => downloadPrintDocument(document.id, `${flyer.title}.pdf`)}
        />
      ) : null}

      <Card>
        <CardContent className="space-y-2 py-5">
          <h2 className="font-semibold text-slate-900">What you are printing</h2>
          <dl className="grid gap-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-slate-500">Size</dt>
              {/* The measured size, not the layout name: several labels
                  already carry nominal dimensions, and OFFICE mode scales
                  some layouts down — this is what the paper will be. */}
              <dd className="font-medium text-slate-900">
                {formatInches(document.finishedInches.width)} ×{' '}
                {formatInches(document.finishedInches.height)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Per sheet</dt>
              <dd className="font-medium text-slate-900">{document.perSheet}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Sides</dt>
              <dd className="font-medium text-slate-900">
                {document.isDoubleSided ? 'Double-sided' : 'Single-sided'}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {capabilities && paperOptions && quantity && paperPreset && urgency ? (
        <Card>
          <CardContent className="py-5">
            <PrintOptionsForm
              capabilities={capabilities}
              paperOptions={paperOptions}
              quantity={quantity}
              paperPreset={paperPreset}
              urgency={urgency}
              sides={deriveSides(document)}
              unavailableUrgencies={advice?.unavailableUrgencies ?? []}
              onQuantityChange={setQuantity}
              onPaperChange={setPaperPreset}
              onUrgencyChange={setUrgency}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex items-center gap-3 py-8">
            <Spinner size="md" className="text-indigo-600" />
            <p className="text-sm text-slate-500">Asking the printer what it can do…</p>
          </CardContent>
        </Card>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardContent className="space-y-4 py-5">
            <div>
              <h2 className="font-semibold text-slate-900">Deliver to</h2>
              <p className="text-sm text-slate-500">
                The postcode decides delivery cost and tax, so the price below is for this address.
              </p>
            </div>
            <DeliveryAddressFields register={register} errors={errors} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 py-5">
            <h2 className="font-semibold text-slate-900">Price</h2>

            {error ? <Alert variant="error">{error}</Alert> : null}

            {!destinationReady ? (
              <p className="text-sm text-slate-500">
                Add the delivery postcode, state and country above to see a price.
              </p>
            ) : quoteState === 'QUOTING' ? (
              <div className="flex items-center gap-3">
                <Spinner size="sm" className="text-indigo-600" />
                <p className="text-sm text-slate-500">Asking the printer for a price…</p>
              </div>
            ) : quoteState === 'FRESH' && quote ? (
              <>
                <QuoteBreakdown quote={quote} />
                {formatQuoteExpiry(quote.expiresAt) ? (
                  <p className="flex items-start gap-1.5 text-sm text-slate-500">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    This price holds until {formatQuoteExpiry(quote.expiresAt)}. After that we will
                    ask the printer again.
                  </p>
                ) : null}
              </>
            ) : quoteState === 'EXPIRED' ? (
              <Alert variant="warning" title="This price has expired">
                Printing prices change, so we will not order against an old figure. Get an updated
                price to carry on — your choices are still here.
              </Alert>
            ) : quoteState === 'STALE' ? (
              <Alert variant="info">
                You have changed the order, so this price no longer applies. Get an updated price to
                see the new total.
              </Alert>
            ) : (
              <p className="text-sm text-slate-500">
                Nothing is ordered by asking for a price.
              </p>
            )}

            {destinationReady && pricedConfig && quoteState !== 'QUOTING' ? (
              <Button
                type="button"
                variant={quoteState === 'FRESH' ? 'outline' : 'primary'}
                leftIcon={<RefreshCw className="h-4 w-4" />}
                onClick={() => requestQuote(pricedConfig)}
              >
                {quoteState === 'NONE' ? 'Get a price' : 'Get an updated price'}
              </Button>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 py-5">
            <Alert variant="info" title="Nothing is charged today">
              Placing this order records what you want printed and locks in this price. Card payment
              is not set up yet, so no money moves and nothing is sent to a printer until it is.
            </Alert>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="submit"
                size="lg"
                // The price must still describe THIS order. Anything else and
                // the church could read one figure and order another.
                disabled={quoteState !== 'FRESH' || isPlacing}
                isLoading={isPlacing}
              >
                Place order
              </Button>
              {quote && quoteState === 'FRESH' ? (
                <span className="text-sm text-slate-600">
                  Total{' '}
                  <span className="font-semibold text-slate-900">
                    {formatMoney(quote.totalCents, quote.currency)}
                  </span>
                </span>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

function Breadcrumb({ flyerId, flyerTitle }: { flyerId: string; flyerTitle: string }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-slate-500">
      <Link to="/creative" className="hover:text-indigo-600">
        Creative Studio
      </Link>
      <ChevronRight className="h-3.5 w-3.5" />
      <Link to={`/creative/${flyerId}`} className="hover:text-indigo-600">
        {flyerTitle}
      </Link>
      <ChevronRight className="h-3.5 w-3.5" />
      <span className="font-medium text-slate-900">Order prints</span>
    </nav>
  );
}
