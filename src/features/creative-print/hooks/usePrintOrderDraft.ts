/**
 * The quote → order state machine.
 *
 * Two things here are load-bearing, and both cost real money if they are
 * wrong:
 *
 * 1. **A price is only shown when it still describes the order.** The quote
 *    is paired with the fingerprint of the configuration that produced it;
 *    the moment any priced field changes, or the quote expires, the total
 *    disappears rather than dimming. A church must never be able to read one
 *    figure and order another.
 * 2. **One intent, one idempotency key.** The key is minted per quote in a
 *    ref and read synchronously inside the mutation — never in an effect
 *    (StrictMode double-fires them), never per click (a double-tap would
 *    become two boxes of flyers), never persisted (a key outliving its quote
 *    is a 409 generator).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { printApi } from '../api/creativePrint.api';
import { newIdempotencyKey } from '../lib/format';
import { fingerprintOf } from '../lib/orderConfig';
import type { PricedConfig } from '../lib/orderConfig';
import type { PrintOrder, PrintQuote, PrintShippingAddress } from '@/types/creativePrint';

export type QuoteState = 'NONE' | 'QUOTING' | 'FRESH' | 'STALE' | 'EXPIRED';

interface UsePrintOrderDraftResult {
  quote: PrintQuote | null;
  quoteState: QuoteState;
  /** Set when the last quote or order attempt failed, in the server's words. */
  error: string | null;
  isPlacing: boolean;
  requestQuote: (config: PricedConfig) => void;
  placeOrder: (address: PrintShippingAddress | null, onPlaced: (order: PrintOrder) => void) => void;
  reset: () => void;
}

/** How often the expiry clock ticks. Also recomputed on every render. */
const EXPIRY_TICK_MS = 30_000;

export function usePrintOrderDraft(config: PricedConfig | null): UsePrintOrderDraftResult {
  const [quote, setQuote] = useState<PrintQuote | null>(null);
  const [quotedFingerprint, setQuotedFingerprint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // The server is the authority on expiry: our own clock can be behind, and
  // the quote object we hold still claims hours of life. A 409 at order time
  // must therefore retire the price here too — otherwise the total stays on
  // screen above a live button that will keep failing.
  const [serverRejectedQuote, setServerRejectedQuote] = useState(false);
  // Only exists to re-render on the expiry boundary; the predicate below is
  // what actually decides, so a missed tick (a sleeping laptop) is harmless.
  const [, setClock] = useState(0);

  const fingerprint = config ? fingerprintOf(config) : null;

  const expiresAt = quote?.expiresAt ?? null;
  useEffect(() => {
    if (!expiresAt) return;
    // Stops itself once the boundary is crossed: after that the verdict can
    // no longer change, and a timer re-rendering the page every 30 seconds
    // for the rest of the session buys nothing.
    const timer = setInterval(() => {
      setClock((n) => n + 1);
      if (Date.now() >= Date.parse(expiresAt)) clearInterval(timer);
    }, EXPIRY_TICK_MS);
    return () => clearInterval(timer);
  }, [expiresAt]);

  const quoteState: QuoteState = useMemo(() => {
    if (!quote) return 'NONE';
    if (serverRejectedQuote) return 'EXPIRED';
    if (quote.expiresAt && Date.now() >= Date.parse(quote.expiresAt)) return 'EXPIRED';
    if (quotedFingerprint !== fingerprint) return 'STALE';
    return 'FRESH';
  }, [quote, quotedFingerprint, fingerprint, serverRejectedQuote]);

  const quoteMutation = useMutation({
    mutationFn: (priced: PricedConfig) =>
      printApi
        .createQuote({
          printDocumentId: priced.printDocumentId,
          quantity: priced.quantity,
          paperPreset: priced.paperPreset,
          sides: priced.sides,
          fulfillmentType: priced.fulfillmentType,
          urgency: priced.urgency,
          destination: {
            postalCode: priced.postalCode,
            stateOrProvince: priced.stateOrProvince,
            country: priced.country,
          },
        })
        .then((res) => res.data),
    onSuccess: (fresh, priced) => {
      setQuote(fresh);
      // Pair the price with what it describes, in the same commit.
      setQuotedFingerprint(fingerprintOf(priced));
      setServerRejectedQuote(false);
      setError(null);
    },
    onError: (err) => setError(serverMessage(err, 'Could not get a price. Please try again.')),
  });

  // Keyed by quote id: a new quote earns a new key (reusing one against a
  // different quote is a 409 by design), and every retry of the SAME quote —
  // double-tap, network timeout, browser Back — reuses it.
  const orderKeyRef = useRef<{ quoteId: string; key: string } | null>(null);

  const orderMutation = useMutation({
    mutationFn: ({ address }: { address: PrintShippingAddress | null }) => {
      if (!quote) throw new Error('Get a price before placing the order.');
      if (orderKeyRef.current?.quoteId !== quote.id) {
        orderKeyRef.current = { quoteId: quote.id, key: newIdempotencyKey() };
      }
      return printApi
        .createOrder({
          quoteId: quote.id,
          idempotencyKey: orderKeyRef.current.key,
          shippingAddress: address ?? undefined,
        })
        .then((res) => res.data);
    },
    onError: (err) => {
      setError(serverMessage(err, 'Could not place the order. Nothing has been ordered.'));
      // 409 is either an expired quote or a key already spent on a different
      // one. Both mean this price can no longer be ordered against, so retire
      // it rather than leave a total sitting above a button that will fail.
      if ((err as { response?: { status?: number } })?.response?.status === 409) {
        setServerRejectedQuote(true);
        orderKeyRef.current = null;
      }
    },
  });

  const requestQuote = useCallback(
    (priced: PricedConfig) => {
      setError(null);
      quoteMutation.mutate(priced);
    },
    [quoteMutation]
  );

  const placeOrder = useCallback(
    (address: PrintShippingAddress | null, onPlaced: (order: PrintOrder) => void) => {
      setError(null);
      orderMutation.mutate({ address }, { onSuccess: onPlaced });
    },
    [orderMutation]
  );

  const reset = useCallback(() => {
    setQuote(null);
    setQuotedFingerprint(null);
    setServerRejectedQuote(false);
    setError(null);
    orderKeyRef.current = null;
  }, []);

  return {
    quote,
    quoteState: quoteMutation.isPending ? 'QUOTING' : quoteState,
    error,
    isPlacing: orderMutation.isPending,
    requestQuote,
    placeOrder,
    reset,
  };
}

/**
 * The server writes these messages for church staff — an expired quote or a
 * withdrawn approval explains itself far better than anything generic.
 */
function serverMessage(err: unknown, fallback: string): string {
  const responseMessage = (err as { response?: { data?: { error?: { message?: string }; message?: string } } })
    ?.response?.data;
  return (
    responseMessage?.error?.message ??
    responseMessage?.message ??
    (err instanceof Error ? err.message : undefined) ??
    fallback
  );
}
