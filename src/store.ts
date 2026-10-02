import { chapters } from './data/story'

/**
 * Mutable, render-loop friendly state. Scroll writes `target`; the 3D
 * loop damps `progress` toward it so motion stays smooth on any input.
 */
export const journey = {
  /** Raw scroll progress through the journey section, 0..1. */
  target: 0,
  /** Smoothed progress, written by the render loop. */
  progress: 0,
  /** Smoothed progress velocity (units / s), for wheels and pedalling. */
  velocity: 0,
  /** Accumulated travel distance along the road, in world units. */
  distance: 0,
}

export const CHAPTER_COUNT = chapters.length

/** Progress at which chapter `i` is centred. */
export const chapterCenter = (i: number) => (i + 0.5) / CHAPTER_COUNT

/** Fractional chapter index for a progress value. */
export const chapterAt = (p: number) =>
  Math.min(CHAPTER_COUNT - 1, Math.max(0, Math.floor(p * CHAPTER_COUNT)))
