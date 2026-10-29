/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BarcodeType } from '../types/wallet';

interface BarcodeRendererProps {
  type: BarcodeType;
  value: string;
  width?: number;
  height?: number;
  showText?: boolean;
  className?: string;
}

// Simple hash deterministic generator for realistic 2D matrix patterns (QR, Aztec, PDF417)
function getMatrixFromSeed(seed: string, size: number, cornerMarkers = true): boolean[][] {
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  
  // Seed hash
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }

  // PRNG
  const random = () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    return (h >>> 16) / 65536;
  };

  // Populate data dots
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      matrix[r][c] = random() > 0.52;
    }
  }

  if (cornerMarkers && size >= 15) {
    // Stamp QR corner finder patterns
    const stampFinder = (startR: number, startC: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
          const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          matrix[startR + r][startC + c] = isOuter || isInner;
        }
      }
      // White separator
      for (let i = 0; i < 8; i++) {
        if (startR + 7 < size && startC + i < size) matrix[startR + 7][startC + i] = false;
        if (startR + i < size && startC + 7 < size) matrix[startR + i][startC + 7] = false;
        if (startR - 1 >= 0 && startC + i < size) matrix[startR - 1][startC + i] = false;
        if (startR + i < size && startC - 1 >= 0) matrix[startR + i][startC - 1] = false;
      }
    };

    stampFinder(0, 0); // Top left
    stampFinder(0, size - 7); // Top right
    stampFinder(size - 7, 0); // Bottom left

    // Timing patterns
    for (let i = 8; i < size - 8; i++) {
      matrix[6][i] = i % 2 === 0;
      matrix[i][6] = i % 2 === 0;
    }
  }

  return matrix;
}

// Generate Aztec pattern (concentric square bullseye in center)
function getAztecMatrix(seed: string, size = 19): boolean[][] {
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  let h = 0x12345678;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 1103515245);
  }
  const random = () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    return (h >>> 16) / 65536;
  };

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      matrix[r][c] = random() > 0.5;
    }
  }

  // Bullseye in center
  const center = Math.floor(size / 2);
  for (let ring = 0; ring <= 4; ring++) {
    const isBlack = ring % 2 === 0;
    for (let r = center - ring; r <= center + ring; r++) {
      for (let c = center - ring; c <= center + ring; c++) {
        if (
          r === center - ring ||
          r === center + ring ||
          c === center - ring ||
          c === center + ring
        ) {
          matrix[r][c] = isBlack;
        }
      }
    }
  }

  return matrix;
}

// Generate PDF417 bar sequence (stacked multi-row pattern)
function getPdf417Bars(seed: string): { rows: boolean[][]; rowCount: number; colCount: number } {
  const rowCount = 6;
  const colCount = 42;
  const rows: boolean[][] = [];
  
  let h = 0x55aa55aa;
  for (let i = 0; i < seed.length; i++) {
    h = (h + seed.charCodeAt(i) * 31) >>> 0;
  }
  const random = () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    return (h >>> 16) / 65536;
  };

  for (let r = 0; r < rowCount; r++) {
    const row: boolean[] = [];
    // Start pattern: 8 bars [1, 1, 1, 1, 1, 1, 0, 1]
    const startPattern = [true, false, true, true, false, true, false, true];
    row.push(...startPattern);
    
    // Data columns
    for (let c = 8; c < colCount - 8; c++) {
      row.push(random() > 0.45);
    }
    
    // Stop pattern
    const stopPattern = [true, false, true, false, true, true, false, true];
    row.push(...stopPattern);
    rows.push(row);
  }

  return { rows, rowCount, colCount };
}

// 1D Barcode bars generator (Code 128 / EAN13 simulation)
function get1DBars(value: string, count = 65): boolean[] {
  const bars: boolean[] = [];
  let h = 0xabcdef01;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 2166136261);
  }
  const random = () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    return (h >>> 16) / 65536;
  };

  // Guard bars
  bars.push(true, false, true);

  for (let i = 3; i < count - 3; i++) {
    // Keep reasonable runs of black & white
    bars.push(random() > 0.48);
  }

  // Guard bars
  bars.push(true, false, true);

  return bars;
}

export const BarcodeRenderer: React.FC<BarcodeRendererProps> = ({
  type,
  value,
  showText = true,
  className = '',
}) => {
  if (type === 'none' || !value) {
    return null;
  }

  if (type === 'qr') {
    const size = 21;
    const matrix = getMatrixFromSeed(value, size, true);
    return (
      <div className={`flex flex-col items-center justify-center p-3 bg-white rounded-xl ${className}`}>
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-36 h-36 max-w-full drop-shadow-sm"
          shapeRendering="crispEdges"
        >
          {matrix.map((row, r) =>
            row.map((filled, c) =>
              filled ? (
                <rect key={`${r}-${c}`} x={c} y={r} width="1.02" height="1.02" fill="#0f172a" />
              ) : null
            )
          )}
        </svg>
        {showText && (
          <span className="mt-2 text-xs font-mono font-semibold tracking-wider text-slate-800 break-all text-center max-w-[200px]">
            {value}
          </span>
        )}
      </div>
    );
  }

  if (type === 'aztec') {
    const size = 23;
    const matrix = getAztecMatrix(value, size);
    return (
      <div className={`flex flex-col items-center justify-center p-3 bg-white rounded-xl ${className}`}>
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-36 h-36 max-w-full drop-shadow-sm"
          shapeRendering="crispEdges"
        >
          {matrix.map((row, r) =>
            row.map((filled, c) =>
              filled ? (
                <rect key={`${r}-${c}`} x={c} y={r} width="1.02" height="1.02" fill="#0f172a" />
              ) : null
            )
          )}
        </svg>
        {showText && (
          <span className="mt-2 text-[11px] font-mono font-semibold text-slate-800 tracking-wide text-center">
            {value}
          </span>
        )}
      </div>
    );
  }

  if (type === 'pdf417') {
    const { rows, rowCount, colCount } = getPdf417Bars(value);
    return (
      <div className={`flex flex-col items-center justify-center p-3 bg-white rounded-xl ${className}`}>
        <svg
          viewBox={`0 0 ${colCount} ${rowCount * 5}`}
          className="w-56 h-16 max-w-full"
          shapeRendering="crispEdges"
        >
          {rows.map((row, rIdx) =>
            row.map((filled, cIdx) =>
              filled ? (
                <rect
                  key={`${rIdx}-${cIdx}`}
                  x={cIdx}
                  y={rIdx * 5}
                  width="1"
                  height="4.8"
                  fill="#0f172a"
                />
              ) : null
            )
          )}
        </svg>
        {showText && (
          <span className="mt-1.5 text-xs font-mono font-semibold text-slate-800 tracking-wider">
            {value}
          </span>
        )}
      </div>
    );
  }

  if (type === 'datamatrix') {
    const size = 18;
    const matrix = getMatrixFromSeed(value, size, false);
    // Draw L-finder pattern on left and bottom
    for (let i = 0; i < size; i++) {
      matrix[size - 1][i] = true;
      matrix[i][0] = true;
      matrix[0][i] = i % 2 === 0;
      matrix[i][size - 1] = i % 2 === 1;
    }
    return (
      <div className={`flex flex-col items-center justify-center p-3 bg-white rounded-xl ${className}`}>
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-32 h-32 max-w-full drop-shadow-sm"
          shapeRendering="crispEdges"
        >
          {matrix.map((row, r) =>
            row.map((filled, c) =>
              filled ? (
                <rect key={`${r}-${c}`} x={c} y={r} width="1.02" height="1.02" fill="#0f172a" />
              ) : null
            )
          )}
        </svg>
        {showText && (
          <span className="mt-2 text-xs font-mono font-semibold text-slate-800">
            {value}
          </span>
        )}
      </div>
    );
  }

  // 1D Barcode: Code 128 / EAN13 default
  const barCount = type === 'ean13' ? 59 : 75;
  const bars = get1DBars(value, barCount);

  return (
    <div className={`flex flex-col items-center justify-center p-3 bg-white rounded-xl ${className}`}>
      <svg
        viewBox={`0 0 ${barCount * 2} 50`}
        className="w-full h-16 max-w-[280px]"
        preserveAspectRatio="none"
        shapeRendering="crispEdges"
      >
        {bars.map((isBar, idx) =>
          isBar ? (
            <rect
              key={idx}
              x={idx * 2}
              y="0"
              width="2"
              height="50"
              fill="#0f172a"
            />
          ) : null
        )}
      </svg>
      {showText && (
        <span className="mt-1 text-sm font-mono font-bold tracking-[0.2em] text-slate-900">
          {value}
        </span>
      )}
    </div>
  );
};
