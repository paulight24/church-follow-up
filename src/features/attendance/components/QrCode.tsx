import { useMemo } from 'react';
import { encodeQrMatrix, qrMatrixToSvgPath, type QrEccLevel } from '@/features/attendance/lib/qrcode';

interface QrCodeProps {
  /** Text to encode, e.g. a check-in URL. */
  value: string;
  /** Rendered pixel size (width and height), default 240. */
  size?: number;
  /** Error-correction level, default 'M'. */
  ecc?: QrEccLevel;
  /** Modules of white margin around the code, default 4 (the QR spec's recommended minimum). */
  quietZone?: number;
  className?: string;
  'aria-label'?: string;
}

/** Renders `value` as a real, scannable QR code (pure black modules on a white background). */
export function QrCode({
  value,
  size = 240,
  ecc = 'M',
  quietZone = 4,
  className,
  'aria-label': ariaLabel,
}: QrCodeProps) {
  const matrix = useMemo(() => encodeQrMatrix(value, ecc), [value, ecc]);
  const path = useMemo(() => qrMatrixToSvgPath(matrix), [matrix]);
  const total = matrix.size + quietZone * 2;

  return (
    <svg
      viewBox={`0 0 ${total} ${total}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      role="img"
      aria-label={ariaLabel ?? `QR code for ${value}`}
      className={className}
    >
      <rect x={0} y={0} width={total} height={total} fill="#fff" />
      <g transform={`translate(${quietZone}, ${quietZone})`}>
        <path d={path} fill="#000" />
      </g>
    </svg>
  );
}
