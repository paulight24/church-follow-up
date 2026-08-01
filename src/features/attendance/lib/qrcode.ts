/**
 * Minimal, dependency-free QR Code (ISO/IEC 18004, Model 2) encoder + SVG renderer.
 *
 * Implements the pieces of the standard needed to reliably encode arbitrary text
 * (in particular check-in URLs, 40-200+ chars) as a scannable QR code:
 *   - byte-mode data segment encoding (mode indicator + character count + data)
 *   - automatic version (1-40) selection for the requested error-correction level
 *   - Reed-Solomon error correction over GF(256)
 *   - correct splitting of data into blocks + interleaving of data/EC codewords
 *   - finder / separator / timing / alignment pattern placement
 *   - format information (2 bits ECC level + 3 bits mask) with BCH error correction
 *   - version information (for versions >= 7) with BCH error correction
 *   - zig-zag codeword placement (skipping the vertical timing column)
 *   - evaluation of all 8 standard mask patterns using the 4 standard penalty rules,
 *     picking whichever mask minimizes the penalty score
 *
 * Only byte mode is implemented (every character is encoded as its UTF-8 byte
 * sequence). This is intentionally simpler than a full multi-mode encoder and is
 * the correct default for URLs, which routinely contain lowercase letters that
 * are not representable in QR's restricted alphanumeric mode.
 *
 * The numeric tables below (error-correction codewords per block, and number of
 * error-correction blocks, indexed by version and ECC level) are the fixed
 * constants defined by the ISO/IEC 18004 standard itself (Annex, "Table 9" family)
 * -- they are not derivable from a formula and are reproduced here as plain data.
 */

/* ============================================================
 * Public types
 * ============================================================ */

export interface QrMatrix {
  /** Modules per side, NOT including the quiet-zone margin. */
  size: number;
  /** size x size grid; true = dark/black module. */
  modules: boolean[][];
}

export type QrEccLevel = 'L' | 'M' | 'Q' | 'H';

/* ============================================================
 * Error-correction level tables (ISO/IEC 18004)
 * ============================================================ */

/** Ordinal used to index the per-version tables below (L, M, Q, H). */
const ECC_ORDINAL: Record<QrEccLevel, number> = { L: 0, M: 1, Q: 2, H: 3 };

/** 2-bit value written into the format-information field for each ECC level. */
const ECC_FORMAT_BITS: Record<QrEccLevel, number> = { L: 1, M: 0, Q: 3, H: 2 };

/** Number of EC codewords per block, indexed [ECC ordinal][version - 1]. */
const ECC_CODEWORDS_PER_BLOCK: readonly (readonly number[])[] = [
  // L
  [
    7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30,
    26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
  ],
  // M
  [
    10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28,
    28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28,
  ],
  // Q
  [
    13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30,
    30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
  ],
  // H
  [
    17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30,
    30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
  ],
];

/** Number of EC blocks, indexed [ECC ordinal][version - 1]. */
const NUM_ERROR_CORRECTION_BLOCKS: readonly (readonly number[])[] = [
  // L
  [
    1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15,
    16, 17, 18, 19, 19, 20, 21, 22, 24, 25,
  ],
  // M
  [
    1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25,
    26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49,
  ],
  // Q
  [
    1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34,
    35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68,
  ],
  // H
  [
    1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37,
    40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81,
  ],
];

/* ============================================================
 * Data encoding (byte mode)
 * ============================================================ */

const MODE_INDICATOR_BYTE = 0x4;

/** Bit width of the character-count field for byte mode at a given version. */
function charCountBits(version: number): number {
  return version <= 9 ? 8 : 16;
}

/** Number of data-carrying modules (bits) available in a symbol, before ECC split. */
function getNumRawDataModules(version: number): number {
  let result = (16 * version + 128) * version + 64;
  if (version >= 2) {
    const numAlign = Math.floor(version / 7) + 2;
    result -= (25 * numAlign - 10) * numAlign - 55;
    if (version >= 7) {
      result -= 36;
    }
  }
  return result;
}

/** Number of 8-bit data codewords (i.e. not error correction) for version+ECC level. */
function getNumDataCodewords(version: number, ecc: QrEccLevel): number {
  const ord = ECC_ORDINAL[ecc];
  const eccPerBlock = ECC_CODEWORDS_PER_BLOCK[ord][version - 1];
  const numBlocks = NUM_ERROR_CORRECTION_BLOCKS[ord][version - 1];
  return Math.floor(getNumRawDataModules(version) / 8) - eccPerBlock * numBlocks;
}

/** Smallest QR version (1-40) that can hold `byteLength` bytes of byte-mode data. */
function selectVersion(byteLength: number, ecc: QrEccLevel): number {
  for (let version = 1; version <= 40; version++) {
    const capacityBits = getNumDataCodewords(version, ecc) * 8;
    const usedBits = 4 + charCountBits(version) + byteLength * 8;
    if (usedBits <= capacityBits) {
      return version;
    }
  }
  throw new Error(
    `Text is too long to encode as a QR code at ECC level "${ecc}" (${byteLength} bytes exceeds the version-40 capacity). ` +
      'Use a shorter value or a lower ECC level.',
  );
}

/** Simple growable bit buffer used while assembling the data codeword stream. */
class BitBuffer {
  private bits: number[] = [];

  get length(): number {
    return this.bits.length;
  }

  appendBits(value: number, len: number): void {
    for (let i = len - 1; i >= 0; i--) {
      this.bits.push((value >>> i) & 1);
    }
  }

  /** Packs the buffer (must already be a multiple of 8 bits) into bytes, MSB first. */
  toBytes(): number[] {
    const out: number[] = [];
    for (let i = 0; i < this.bits.length; i += 8) {
      let byte = 0;
      for (let j = 0; j < 8; j++) {
        byte = (byte << 1) | (this.bits[i + j] ?? 0);
      }
      out.push(byte);
    }
    return out;
  }
}

/** Builds the padded, byte-mode data codeword stream for the given version/ECC. */
function buildDataCodewords(bytes: Uint8Array, version: number, ecc: QrEccLevel): number[] {
  const capacityBits = getNumDataCodewords(version, ecc) * 8;
  const bb = new BitBuffer();
  bb.appendBits(MODE_INDICATOR_BYTE, 4);
  bb.appendBits(bytes.length, charCountBits(version));
  for (const b of bytes) {
    bb.appendBits(b, 8);
  }
  if (bb.length > capacityBits) {
    // Should be unreachable because selectVersion() already checked this.
    throw new Error('Internal error: encoded data exceeds the selected version capacity.');
  }

  // Terminator (up to 4 zero bits).
  bb.appendBits(0, Math.min(4, capacityBits - bb.length));
  // Pad to a byte boundary.
  bb.appendBits(0, (8 - (bb.length % 8)) % 8);

  const codewords = bb.toBytes();
  // Pad with the alternating standard pad codewords until capacity is reached.
  let padToggle = true;
  while (codewords.length < capacityBits / 8) {
    codewords.push(padToggle ? 0xec : 0x11);
    padToggle = !padToggle;
  }
  return codewords;
}

/* ============================================================
 * GF(256) math / Reed-Solomon error correction
 * ============================================================ */

/** Multiplies two elements of GF(256) modulo the QR primitive polynomial 0x11D. */
function gf256Multiply(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}

/** Computes the Reed-Solomon generator polynomial of the given degree. */
function rsComputeDivisor(degree: number): number[] {
  const result = new Array<number>(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = gf256Multiply(result[j], root);
      if (j + 1 < result.length) {
        result[j] ^= result[j + 1];
      }
    }
    root = gf256Multiply(root, 0x02);
  }
  return result;
}

/** Computes the Reed-Solomon remainder (the EC codewords) of `data` w.r.t. `divisor`. */
function rsComputeRemainder(data: readonly number[], divisor: readonly number[]): number[] {
  const result = new Array<number>(divisor.length).fill(0);
  for (const b of data) {
    const factor = b ^ result[0];
    result.shift();
    result.push(0);
    for (let i = 0; i < divisor.length; i++) {
      result[i] ^= gf256Multiply(divisor[i], factor);
    }
  }
  return result;
}

/** Splits data into ECC blocks, appends EC codewords, and interleaves the result. */
function addEccAndInterleave(data: readonly number[], version: number, ecc: QrEccLevel): number[] {
  const ord = ECC_ORDINAL[ecc];
  const numBlocks = NUM_ERROR_CORRECTION_BLOCKS[ord][version - 1];
  const blockEccLen = ECC_CODEWORDS_PER_BLOCK[ord][version - 1];
  const rawCodewords = Math.floor(getNumRawDataModules(version) / 8);
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
  const shortBlockDataLen = Math.floor(rawCodewords / numBlocks) - blockEccLen;

  const divisor = rsComputeDivisor(blockEccLen);
  const blocks: number[][] = [];
  let k = 0;
  for (let i = 0; i < numBlocks; i++) {
    const dataLen = shortBlockDataLen + (i < numShortBlocks ? 0 : 1);
    const dat = data.slice(k, k + dataLen);
    k += dataLen;
    const eccBytes = rsComputeRemainder(dat, divisor);
    const fullDat = i < numShortBlocks ? [...dat, 0] : dat.slice();
    blocks.push([...fullDat, ...eccBytes]);
  }

  const result: number[] = [];
  const blockLen = blocks[0]?.length ?? 0;
  for (let i = 0; i < blockLen; i++) {
    for (let j = 0; j < blocks.length; j++) {
      // Skip the padding byte inserted into short blocks at this position.
      if (i !== shortBlockDataLen || j >= numShortBlocks) {
        result.push(blocks[j][i]);
      }
    }
  }
  return result;
}

/* ============================================================
 * Matrix construction: function patterns, codeword placement
 * ============================================================ */

interface WorkingMatrix {
  size: number;
  modules: boolean[][];
  isFunction: boolean[][];
}

function createWorkingMatrix(version: number): WorkingMatrix {
  const size = version * 4 + 17;
  const modules: boolean[][] = [];
  const isFunction: boolean[][] = [];
  for (let i = 0; i < size; i++) {
    modules.push(new Array<boolean>(size).fill(false));
    isFunction.push(new Array<boolean>(size).fill(false));
  }
  return { size, modules, isFunction };
}

function setFunctionModule(m: WorkingMatrix, x: number, y: number, dark: boolean): void {
  m.modules[y][x] = dark;
  m.isFunction[y][x] = true;
}

function drawFinderPattern(m: WorkingMatrix, x: number, y: number): void {
  for (let dy = -4; dy <= 4; dy++) {
    for (let dx = -4; dx <= 4; dx++) {
      const xx = x + dx;
      const yy = y + dy;
      if (xx >= 0 && xx < m.size && yy >= 0 && yy < m.size) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        setFunctionModule(m, xx, yy, dist !== 2 && dist !== 4);
      }
    }
  }
}

function drawAlignmentPattern(m: WorkingMatrix, x: number, y: number): void {
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      setFunctionModule(m, x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
  }
}

/** Ascending list of alignment-pattern center coordinates (same for x and y axes). */
function getAlignmentPatternPositions(version: number): number[] {
  if (version === 1) {
    return [];
  }
  const numAlign = Math.floor(version / 7) + 2;
  const size = version * 4 + 17;
  const step = Math.floor((version * 8 + numAlign * 3 + 5) / (numAlign * 4 - 4)) * 2;
  const result = [6];
  for (let pos = size - 7; result.length < numAlign; pos -= step) {
    result.splice(1, 0, pos);
  }
  return result;
}

function getBit(x: number, i: number): boolean {
  return ((x >>> i) & 1) !== 0;
}

/** Draws (or redraws) the two copies of the format-information bits for a given mask. */
function drawFormatBits(m: WorkingMatrix, ecc: QrEccLevel, mask: number): void {
  const data = (ECC_FORMAT_BITS[ecc] << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i++) {
    rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  }
  const bits = ((data << 10) | rem) ^ 0x5412;

  for (let i = 0; i <= 5; i++) {
    setFunctionModule(m, 8, i, getBit(bits, i));
  }
  setFunctionModule(m, 8, 7, getBit(bits, 6));
  setFunctionModule(m, 8, 8, getBit(bits, 7));
  setFunctionModule(m, 7, 8, getBit(bits, 8));
  for (let i = 9; i < 15; i++) {
    setFunctionModule(m, 14 - i, 8, getBit(bits, i));
  }

  for (let i = 0; i < 8; i++) {
    setFunctionModule(m, m.size - 1 - i, 8, getBit(bits, i));
  }
  for (let i = 8; i < 15; i++) {
    setFunctionModule(m, 8, m.size - 15 + i, getBit(bits, i));
  }
  setFunctionModule(m, 8, m.size - 8, true);
}

function drawVersionInfo(m: WorkingMatrix, version: number): void {
  if (version < 7) {
    return;
  }
  let rem = version;
  for (let i = 0; i < 12; i++) {
    rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
  }
  const bits = (version << 12) | rem;
  for (let i = 0; i < 18; i++) {
    const color = getBit(bits, i);
    const a = m.size - 11 + (i % 3);
    const b = Math.floor(i / 3);
    setFunctionModule(m, a, b, color);
    setFunctionModule(m, b, a, color);
  }
}

function drawFunctionPatterns(m: WorkingMatrix, version: number, ecc: QrEccLevel): void {
  // Timing patterns.
  for (let i = 0; i < m.size; i++) {
    setFunctionModule(m, 6, i, i % 2 === 0);
    setFunctionModule(m, i, 6, i % 2 === 0);
  }

  // Finder patterns (top-left, top-right, bottom-left) with separators.
  drawFinderPattern(m, 3, 3);
  drawFinderPattern(m, m.size - 4, 3);
  drawFinderPattern(m, 3, m.size - 4);

  // Alignment patterns.
  const alignPos = getAlignmentPatternPositions(version);
  const numAlign = alignPos.length;
  for (let i = 0; i < numAlign; i++) {
    for (let j = 0; j < numAlign; j++) {
      // Skip the three positions that overlap the finder patterns.
      const isTopLeft = i === 0 && j === 0;
      const isTopRight = i === 0 && j === numAlign - 1;
      const isBottomLeft = i === numAlign - 1 && j === 0;
      if (!isTopLeft && !isTopRight && !isBottomLeft) {
        drawAlignmentPattern(m, alignPos[i], alignPos[j]);
      }
    }
  }

  // Placeholder format info (real mask filled in later) + version info.
  drawFormatBits(m, ecc, 0);
  drawVersionInfo(m, version);
}

/** Zig-zag places codewords (data + EC, already interleaved) into the free modules. */
function drawCodewords(m: WorkingMatrix, data: readonly number[]): void {
  let i = 0;
  for (let right = m.size - 1; right >= 1; right -= 2) {
    if (right === 6) {
      right = 5;
    }
    for (let vert = 0; vert < m.size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? m.size - 1 - vert : vert;
        if (!m.isFunction[y][x] && i < data.length * 8) {
          m.modules[y][x] = getBit(data[i >>> 3], 7 - (i & 7));
          i++;
        }
      }
    }
  }
}

/* ============================================================
 * Masking + penalty scoring
 * ============================================================ */

function maskInvert(mask: number, x: number, y: number): boolean {
  switch (mask) {
    case 0:
      return (x + y) % 2 === 0;
    case 1:
      return y % 2 === 0;
    case 2:
      return x % 3 === 0;
    case 3:
      return (x + y) % 3 === 0;
    case 4:
      return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
    case 5:
      return ((x * y) % 2) + ((x * y) % 3) === 0;
    case 6:
      return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
    case 7:
      return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
    default:
      throw new Error(`Invalid mask pattern: ${mask}`);
  }
}

function applyMask(m: WorkingMatrix, mask: number): void {
  for (let y = 0; y < m.size; y++) {
    for (let x = 0; x < m.size; x++) {
      if (!m.isFunction[y][x] && maskInvert(mask, x, y)) {
        m.modules[y][x] = !m.modules[y][x];
      }
    }
  }
}

const PENALTY_N1 = 3;
const PENALTY_N2 = 3;
const PENALTY_N3 = 40;
const PENALTY_N4 = 10;

/** Can only be called right after a light run is appended to the history. */
function finderPenaltyCountPatterns(runHistory: readonly number[]): number {
  const n = runHistory[1];
  const core =
    n > 0 &&
    runHistory[2] === n &&
    runHistory[3] === n * 3 &&
    runHistory[4] === n &&
    runHistory[5] === n;
  let count = 0;
  if (core && runHistory[0] >= n * 4 && runHistory[6] >= n) {
    count++;
  }
  if (core && runHistory[6] >= n * 4 && runHistory[0] >= n) {
    count++;
  }
  return count;
}

function finderPenaltyAddHistory(runLength: number, runHistory: number[], size: number): void {
  let len = runLength;
  if (runHistory[0] === 0) {
    len += size; // Initial run: treat the edge of the symbol as a light border.
  }
  runHistory.pop();
  runHistory.unshift(len);
}

function finderPenaltyTerminateAndCount(
  currentRunColor: boolean,
  currentRunLength: number,
  runHistory: number[],
  size: number,
): number {
  let len = currentRunLength;
  if (currentRunColor) {
    finderPenaltyAddHistory(len, runHistory, size);
    len = 0;
  }
  len += size; // Light border at the end of the line.
  finderPenaltyAddHistory(len, runHistory, size);
  return finderPenaltyCountPatterns(runHistory);
}

function getPenaltyScore(m: WorkingMatrix): number {
  let result = 0;
  const size = m.size;

  // Rule 1 + finder-like patterns, rows.
  for (let y = 0; y < size; y++) {
    let runColor = false;
    let runX = 0;
    const runHistory = [0, 0, 0, 0, 0, 0, 0];
    for (let x = 0; x < size; x++) {
      if (m.modules[y][x] === runColor) {
        runX++;
        if (runX === 5) {
          result += PENALTY_N1;
        } else if (runX > 5) {
          result++;
        }
      } else {
        finderPenaltyAddHistory(runX, runHistory, size);
        if (!runColor) {
          result += finderPenaltyCountPatterns(runHistory) * PENALTY_N3;
        }
        runColor = m.modules[y][x];
        runX = 1;
      }
    }
    result += finderPenaltyTerminateAndCount(runColor, runX, runHistory, size) * PENALTY_N3;
  }

  // Rule 1 + finder-like patterns, columns.
  for (let x = 0; x < size; x++) {
    let runColor = false;
    let runY = 0;
    const runHistory = [0, 0, 0, 0, 0, 0, 0];
    for (let y = 0; y < size; y++) {
      if (m.modules[y][x] === runColor) {
        runY++;
        if (runY === 5) {
          result += PENALTY_N1;
        } else if (runY > 5) {
          result++;
        }
      } else {
        finderPenaltyAddHistory(runY, runHistory, size);
        if (!runColor) {
          result += finderPenaltyCountPatterns(runHistory) * PENALTY_N3;
        }
        runColor = m.modules[y][x];
        runY = 1;
      }
    }
    result += finderPenaltyTerminateAndCount(runColor, runY, runHistory, size) * PENALTY_N3;
  }

  // Rule 2: 2x2 blocks of the same color.
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const color = m.modules[y][x];
      if (
        color === m.modules[y][x + 1] &&
        color === m.modules[y + 1][x] &&
        color === m.modules[y + 1][x + 1]
      ) {
        result += PENALTY_N2;
      }
    }
  }

  // Rule 4: balance of dark vs. light modules.
  let dark = 0;
  for (const row of m.modules) {
    for (const cell of row) {
      if (cell) {
        dark++;
      }
    }
  }
  const total = size * size;
  const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
  result += k * PENALTY_N4;

  return result;
}

/** Picks the mask pattern (0-7) with the lowest penalty score and applies it. */
function applyBestMask(m: WorkingMatrix, ecc: QrEccLevel): number {
  let bestMask = 0;
  let bestPenalty = Number.POSITIVE_INFINITY;
  for (let mask = 0; mask < 8; mask++) {
    applyMask(m, mask);
    drawFormatBits(m, ecc, mask);
    const penalty = getPenaltyScore(m);
    if (penalty < bestPenalty) {
      bestPenalty = penalty;
      bestMask = mask;
    }
    applyMask(m, mask); // XOR-undo this trial mask before trying the next one.
  }
  applyMask(m, bestMask);
  drawFormatBits(m, ecc, bestMask);
  return bestMask;
}

/* ============================================================
 * Public API
 * ============================================================ */

/**
 * Encodes `text` (UTF-8 byte mode) as a QR Code matrix.
 *
 * @param text arbitrary text (e.g. a check-in URL).
 * @param ecc error-correction level, defaults to 'M'.
 * @throws Error if `text` does not fit even at QR version 40 for the requested ECC level.
 */
export function encodeQrMatrix(text: string, ecc: QrEccLevel = 'M'): QrMatrix {
  const bytes = new TextEncoder().encode(text);
  const version = selectVersion(bytes.length, ecc);
  const dataCodewords = buildDataCodewords(bytes, version, ecc);
  const allCodewords = addEccAndInterleave(dataCodewords, version, ecc);

  const working = createWorkingMatrix(version);
  drawFunctionPatterns(working, version, ecc);
  drawCodewords(working, allCodewords);
  applyBestMask(working, ecc);

  return { size: working.size, modules: working.modules };
}

/**
 * Converts a QrMatrix into an SVG `<path>` "d" attribute drawing every dark module
 * as a 1x1 unit square. Intended to be used with `fill-rule="nonzero"` (or the
 * default) on a single `<path>` covering all dark modules.
 */
export function qrMatrixToSvgPath(matrix: QrMatrix): string {
  const parts: string[] = [];
  for (let y = 0; y < matrix.size; y++) {
    for (let x = 0; x < matrix.size; x++) {
      if (matrix.modules[y][x]) {
        parts.push(`M${x} ${y}h1v1h-1z`);
      }
    }
  }
  return parts.join('');
}
