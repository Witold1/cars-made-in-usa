/**
 * Legacy static plot points (synthetic carlines.json).
 * Charts now load from data/releases/* via extendedData.js (default: 2026-draft).
 * Kept for reference / offline tooling; not used by the dashboard.
 */
import carlines from '../../data/carlines.json';
import { buildHierarchy } from './hierarchy.js';

export const initialData = carlines;
export const hierarchy = buildHierarchy(carlines);
