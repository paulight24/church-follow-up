import { Layers, Lock } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import {
  clampQuantity,
  quantityPresets,
  supportedUrgencies,
  URGENCY_DESCRIPTIONS,
} from '../lib/orderConfig';
import { PAPER_LABELS, URGENCY_LABELS } from '../lib/format';
import type {
  PaperOption,
  PaperPreset,
  ProviderCapabilities,
  Sides,
  Urgency,
} from '@/types/creativePrint';

/**
 * How many, on what, how fast.
 *
 * Every option here is read from the ACTIVE provider's capabilities rather
 * than assumed: a quantity the printer will not accept is a 400 after the
 * church has filled in an address, and an urgency it does not offer is a
 * promise nobody can keep. Sides is not offered at all — the print file
 * already has one page or two, and the server rejects a mismatch both ways.
 */
export function PrintOptionsForm({
  capabilities,
  paperOptions,
  quantity,
  paperPreset,
  urgency,
  sides,
  unavailableUrgencies,
  onQuantityChange,
  onPaperChange,
  onUrgencyChange,
}: {
  capabilities: ProviderCapabilities;
  paperOptions: PaperOption[];
  quantity: number;
  paperPreset: string;
  urgency: string;
  sides: Sides;
  /** Urgencies the advisor says cannot arrive in time — offered, but labelled. */
  unavailableUrgencies: Urgency[];
  onQuantityChange: (quantity: number) => void;
  onPaperChange: (preset: PaperPreset) => void;
  onUrgencyChange: (urgency: Urgency) => void;
}) {
  const presets = quantityPresets(capabilities);
  const urgencies = supportedUrgencies(capabilities);

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h3 className="font-semibold text-slate-900">How many?</h3>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onQuantityChange(preset)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                quantity === preset
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {preset.toLocaleString()}
            </button>
          ))}
        </div>
        <Input
          type="number"
          label="Or enter an amount"
          value={quantity}
          min={capabilities.minQuantity}
          max={capabilities.maxQuantity}
          step={capabilities.quantityStep}
          onChange={(e) => onQuantityChange(Number(e.target.value))}
          // Snapped on blur, not on every keystroke: clamping mid-typing
          // fights the person entering "1000" one digit at a time.
          onBlur={(e) => onQuantityChange(clampQuantity(Number(e.target.value), capabilities))}
          helpText={`${capabilities.displayName} prints in batches of ${capabilities.quantityStep}, starting at ${capabilities.minQuantity}.`}
          className="max-w-[220px]"
        />
      </section>

      <section className="space-y-2">
        <h3 className="font-semibold text-slate-900">Paper</h3>
        <div className="grid gap-2 sm:grid-cols-3">
          {paperOptions.map((option) => (
            <button
              key={option.preset}
              type="button"
              onClick={() => onPaperChange(option.preset)}
              className={`rounded-lg border p-3 text-left transition-colors ${
                paperPreset === option.preset
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="font-medium text-slate-900">{option.displayName}</span>
                {option.recommended ? (
                  <span className="text-xs font-medium text-indigo-700">Recommended</span>
                ) : null}
              </span>
              <span className="mt-1 block text-sm text-slate-500">{option.description}</span>
              <span className="sr-only">{PAPER_LABELS[option.preset]}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="font-semibold text-slate-900">How fast?</h3>
        <div className="grid gap-2 sm:grid-cols-3">
          {urgencies.map((option) => {
            const wontArrive = unavailableUrgencies.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => onUrgencyChange(option)}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  urgency === option
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="font-medium text-slate-900">{URGENCY_LABELS[option]}</span>
                <span className="mt-1 block text-sm text-slate-500">
                  {URGENCY_DESCRIPTIONS[option]}
                </span>
                {/* Still selectable: a church may be ordering for the next
                    time. It just must not believe these will arrive. */}
                {wontArrive ? (
                  <span className="mt-1 block text-sm font-medium text-amber-700">
                    Will not arrive in time.
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-1">
        <h3 className="font-semibold text-slate-900">Sides</h3>
        <p className="flex items-center gap-1.5 text-sm text-slate-600">
          <Lock className="h-3.5 w-3.5 text-slate-400" />
          {sides === 'DOUBLE' ? (
            <>
              <Layers className="h-4 w-4 text-slate-400" />
              Double-sided — this print file has a back design.
            </>
          ) : (
            <>
              Single-sided. To print on both sides, build the print file with a back design first.
            </>
          )}
        </p>
      </section>
    </div>
  );
}
