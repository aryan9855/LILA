import { MapConfig } from '../types/telemetry';

/**
 * Maps 3D World Coordinates (x, z) to normalized UV space [0, 1].
 * Formula from LILA Black documentation:
 *   u = (x - origin_x) / scale
 *   v = (z - origin_z) / scale
 */
export function worldToUV(x: number, z: number, config: MapConfig): { u: number; v: number } {
  const u = (x - config.origin_x) / config.scale;
  const v = (z - config.origin_z) / config.scale;
  return { u, v };
}

/**
 * Maps normalized UV coordinates [0, 1] to 2D Canvas pixel coordinates.
 * Note: The vertical axis is inverted because the image/canvas origin (0, 0)
 * is top-left, whereas world Z increases upward.
 *   canvas_x = u * width
 *   canvas_y = (1 - v) * height
 */
export function uvToCanvas(u: number, v: number, width: number, height: number): { x: number; y: number } {
  return {
    x: u * width,
    y: (1 - v) * height
  };
}

/**
 * Inverse mapping: converts 2D Canvas pixel coordinates back to 3D World Coordinates (x, z).
 */
export function canvasToWorld(
  canvasX: number,
  canvasY: number,
  width: number,
  height: number,
  config: MapConfig
): { x: number; z: number } {
  const u = canvasX / width;
  const v = 1 - (canvasY / height);
  const x = u * config.scale + config.origin_x;
  const z = v * config.scale + config.origin_z;
  return { x, z };
}

/**
 * Formats seconds into MM:SS string.
 */
export function formatTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formats epoch seconds to readable local datetime.
 */
export function formatEpochDate(epochSec: number): string {
  if (!epochSec) return 'N/A';
  const d = new Date(epochSec * 1000);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

/**
 * High contrast, distinct player hues for Level Designer journey distinction.
 */
export const HUMAN_PALETTE = [
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Electric Blue
  '#8b5cf6', // Violet
  '#ec4899', // Fuchsia
  '#f43f5e', // Rose
  '#14b8a6', // Teal
  '#6366f1'  // Indigo
];

export const BOT_PALETTE = [
  '#f59e0b', // Amber
  '#eab308', // Yellow
  '#d97706', // Ochre
  '#b45309', // Dark amber
  '#78716c', // Stone
  '#a8a29e'  // Warm Gray
];

export function getPlayerColor(_userId: string, isBot: boolean, index: number): string {
  if (isBot) {
    return BOT_PALETTE[index % BOT_PALETTE.length];
  }
  return HUMAN_PALETTE[index % HUMAN_PALETTE.length];
}
