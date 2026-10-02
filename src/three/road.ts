import * as THREE from 'three'
import { CHAPTER_COUNT } from '../store'

const SEGMENTS = 14
const STEP = 30

// A gently winding road heading along +Z.
const points: THREE.Vector3[] = []
for (let i = 0; i <= SEGMENTS; i++) {
  const x = Math.sin(i * 0.85) * 13 + Math.sin(i * 0.31) * 6
  points.push(new THREE.Vector3(x, 0, i * STEP))
}

export const road = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5)
export const ROAD_LENGTH = road.getLength()
export const ROAD_WIDTH = 4.2

const START = 0.03
const END = 0.97
/** Map journey progress (0..1) to a position along the road (0..1). */
export const roadT = (p: number) => START + Math.min(1, Math.max(0, p)) * (END - START)

/** Road parameter where chapter `i`'s landmark stands. */
export const stationT = (i: number) => roadT((i + 0.5) / CHAPTER_COUNT)

const UP = new THREE.Vector3(0, 1, 0)

export interface Frame {
  point: THREE.Vector3
  tangent: THREE.Vector3
  right: THREE.Vector3
}

export function frameAt(t: number, out?: Frame): Frame {
  const f = out ?? { point: new THREE.Vector3(), tangent: new THREE.Vector3(), right: new THREE.Vector3() }
  const c = Math.min(1, Math.max(0, t))
  road.getPointAt(c, f.point)
  road.getTangentAt(c, f.tangent).setY(0).normalize()
  f.right.crossVectors(f.tangent, UP).normalize()
  return f
}

/** Heading (rotation about Y) for an object whose forward is +Z. */
export const headingOf = (tangent: THREE.Vector3) => Math.atan2(tangent.x, tangent.z)

const samples = road.getSpacedPoints(400)
/**
 * Distance from a point to the road, and which side it is on
 * (+1 = the camera's side, -1 = the far side).
 */
export function nearestOnRoad(x: number, z: number) {
  let best = Infinity, bi = 0
  samples.forEach((s, i) => {
    const d = (s.x - x) ** 2 + (s.z - z) ** 2
    if (d < best) { best = d; bi = i }
  })
  const f = frameAt(bi / (samples.length - 1))
  const side = Math.sign((x - f.point.x) * f.right.x + (z - f.point.z) * f.right.z) || 1
  return { d: Math.sqrt(best), side }
}

/** Deterministic pseudo-random generator so scenery is stable across reloads. */
export function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
