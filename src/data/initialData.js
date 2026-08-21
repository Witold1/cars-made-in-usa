/**
 * Core plot dataset - loaded from crowdsourced JSON under /data.
 * Edit data/carlines.json; hierarchy is derived at import time.
 */
import carlines from '../../data/carlines.json';
import { buildHierarchy } from './hierarchy.js';

export const initialData = carlines;
export const hierarchy = buildHierarchy(carlines);
