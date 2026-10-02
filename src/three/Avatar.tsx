import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { journey } from '../store'

type V3 = [number, number, number]

export interface Pose {
  /** Overall body size: grows from child (≈0.6) to adult (1). */
  size: number
  /** Seat contact point: [y, z]. */
  hip: [number, number]
  /** Right hand target; left is mirrored on X. */
  hand: V3
  /** Pedalling crank ([y, z], radius) or fixed foot rest (right foot; mirrored). */
  feet: { crank: [number, number]; r: number } | { rest: V3 }
  /** Forward lean of the torso, radians. */
  lean: number
  helmet?: string
  backpack?: boolean
}

const SKIN = '#f1c39e'
const HAIR = '#2d211d'
const SHIRT = '#fdfbff'
const JACKET = '#7a86c9'
const PANTS = '#4f5d8f'
const SHOE = '#ffffff'

const UP = new THREE.Vector3(0, 1, 0)
const tmp = new THREE.Vector3()
const tmp2 = new THREE.Vector3()

/** Analytic two-bone IK: returns the middle joint (knee / elbow). */
function solve(a: THREE.Vector3, c: THREE.Vector3, l1: number, l2: number, pole: THREE.Vector3, out: THREE.Vector3) {
  const dir = tmp.copy(c).sub(a)
  const d = Math.min(Math.max(dir.length(), 1e-4), l1 + l2 - 1e-4)
  dir.normalize()
  const x = (l1 * l1 - l2 * l2 + d * d) / (2 * d)
  const h = Math.sqrt(Math.max(0, l1 * l1 - x * x))
  const p = tmp2.copy(pole).addScaledVector(dir, -pole.dot(dir)).normalize()
  return out.copy(a).addScaledVector(dir, x).addScaledVector(p, h)
}

/** Places a unit cylinder between two points. */
function place(mesh: THREE.Object3D | null, a: THREE.Vector3, b: THREE.Vector3, r: number) {
  if (!mesh) return
  const dir = tmp.copy(b).sub(a)
  const len = dir.length()
  mesh.position.copy(a).add(b).multiplyScalar(0.5)
  mesh.quaternion.setFromUnitVectors(UP, dir.divideScalar(len || 1))
  mesh.scale.set(r, len, r)
}

function Skin({ color, refFn, r }: { color: string; refFn: (m: THREE.Mesh | null) => void; r?: number }) {
  return (
    <mesh ref={refFn} castShadow scale={r ?? 1}>
      <sphereGeometry args={[1, 18, 14]} />
      <meshStandardMaterial color={color} roughness={0.6} />
    </mesh>
  )
}

/**
 * A stylised rider built from soft primitives. Limbs are solved every
 * frame so feet stay on the pedals and hands stay on the bars.
 */
export function Rider({ pose }: { pose: Pose }) {
  const limbs = useRef<Record<string, THREE.Mesh | null>>({})
  const set = (k: string) => (m: THREE.Mesh | null) => { limbs.current[k] = m }
  const head = useRef<THREE.Group>(null)
  const torso = useRef<THREE.Mesh>(null)
  const pack = useRef<THREE.Group>(null)

  const j = useMemo(() => ({
    hip: new THREE.Vector3(), sh: new THREE.Vector3(), neck: new THREE.Vector3(),
    hipL: new THREE.Vector3(), hipR: new THREE.Vector3(),
    shL: new THREE.Vector3(), shR: new THREE.Vector3(),
    handL: new THREE.Vector3(), handR: new THREE.Vector3(),
    footL: new THREE.Vector3(), footR: new THREE.Vector3(),
    kneeL: new THREE.Vector3(), kneeR: new THREE.Vector3(),
    elL: new THREE.Vector3(), elR: new THREE.Vector3(),
    legPole: new THREE.Vector3(0, 0.4, 1), armPoleL: new THREE.Vector3(0.6, -1, -0.3), armPoleR: new THREE.Vector3(-0.6, -1, -0.3),
  }), [])

  useFrame((state) => {
    const s = pose.size
    const torsoLen = 0.5 * s, thigh = 0.44 * s, shin = 0.44 * s, upper = 0.29 * s, fore = 0.29 * s
    // Gentle breathing / road bob so the rider never looks frozen.
    const bob = Math.sin(state.clock.elapsedTime * 2.2) * 0.006 + Math.min(0.012, Math.abs(journey.velocity) * 0.01) * Math.sin(journey.distance * 6)

    j.hip.set(0, pose.hip[0] + 0.05 * s + bob, pose.hip[1])
    j.sh.set(0, Math.cos(pose.lean) * torsoLen, Math.sin(pose.lean) * torsoLen).add(j.hip)
    j.neck.copy(j.sh).add(tmp.set(0, 0.17 * s, 0.03 * s))

    j.hipL.copy(j.hip).setX(0.1 * s); j.hipR.copy(j.hip).setX(-0.1 * s)
    j.shL.copy(j.sh).setX(0.17 * s); j.shR.copy(j.sh).setX(-0.17 * s)
    j.handR.set(-Math.abs(pose.hand[0]), pose.hand[1], pose.hand[2])
    j.handL.set(Math.abs(pose.hand[0]), pose.hand[1], pose.hand[2])

    if ('crank' in pose.feet) {
      const a = journey.distance * 1.5
      const [cy, cz] = pose.feet.crank, r = pose.feet.r
      j.footL.set(0.11 * s, cy + Math.sin(a) * r, cz + Math.cos(a) * r)
      j.footR.set(-0.11 * s, cy - Math.sin(a) * r, cz - Math.cos(a) * r)
    } else {
      const [fx, fy, fz] = pose.feet.rest
      j.footL.set(Math.abs(fx), fy, fz)
      j.footR.set(-Math.abs(fx), fy, fz)
    }

    solve(j.hipL, j.footL, thigh, shin, j.legPole, j.kneeL)
    solve(j.hipR, j.footR, thigh, shin, j.legPole, j.kneeR)
    solve(j.shL, j.handL, upper, fore, j.armPoleL, j.elL)
    solve(j.shR, j.handR, upper, fore, j.armPoleR, j.elR)

    const L = limbs.current
    const lr = 0.075 * s, ar = 0.055 * s
    place(L.thighL, j.hipL, j.kneeL, lr); place(L.thighR, j.hipR, j.kneeR, lr)
    place(L.shinL, j.kneeL, j.footL, lr * 0.85); place(L.shinR, j.kneeR, j.footR, lr * 0.85)
    place(L.upL, j.shL, j.elL, ar); place(L.upR, j.shR, j.elR, ar)
    place(L.foreL, j.elL, j.handL, ar * 0.85); place(L.foreR, j.elR, j.handR, ar * 0.85)
    for (const [k, v] of [['kL', j.kneeL], ['kR', j.kneeR], ['eL', j.elL], ['eR', j.elR], ['hL', j.handL], ['hR', j.handR]] as const) {
      L[k]?.position.copy(v)
    }
    L.fL?.position.copy(j.footL).add(tmp.set(0, -0.02 * s, 0.04 * s))
    L.fR?.position.copy(j.footR).add(tmp.set(0, -0.02 * s, 0.04 * s))

    if (torso.current) {
      place(torso.current, j.hip, j.sh, 1)
      torso.current.scale.set(0.16 * s, (torsoLen * 1.25) / 3, 0.12 * s)
    }
    if (head.current) {
      head.current.position.copy(j.neck)
      head.current.scale.setScalar(s)
      // Look slightly toward the road ahead and the camera.
      head.current.rotation.set(-pose.lean * 0.4, Math.sin(state.clock.elapsedTime * 0.5) * 0.15, 0)
    }
    if (pack.current) {
      pack.current.position.copy(j.hip).lerp(j.sh, 0.55).add(tmp.set(0, 0, -0.16 * s))
      pack.current.rotation.x = pose.lean
      pack.current.scale.setScalar(s)
    }
  })

  const s = pose.size
  const jointR = (r: number) => r * s

  return (
    <group>
      <mesh ref={torso} castShadow>
        <capsuleGeometry args={[1, 1, 6, 16]} />
        <meshStandardMaterial color={pose.helmet ? JACKET : SHIRT} roughness={0.7} />
      </mesh>
      <mesh ref={set('thighL')} castShadow><cylinderGeometry args={[1, 1, 1, 12]} /><meshStandardMaterial color={PANTS} roughness={0.8} /></mesh>
      <mesh ref={set('thighR')} castShadow><cylinderGeometry args={[1, 1, 1, 12]} /><meshStandardMaterial color={PANTS} roughness={0.8} /></mesh>
      <mesh ref={set('shinL')} castShadow><cylinderGeometry args={[1, 1, 1, 12]} /><meshStandardMaterial color={PANTS} roughness={0.8} /></mesh>
      <mesh ref={set('shinR')} castShadow><cylinderGeometry args={[1, 1, 1, 12]} /><meshStandardMaterial color={PANTS} roughness={0.8} /></mesh>
      <mesh ref={set('upL')} castShadow><cylinderGeometry args={[1, 1, 1, 12]} /><meshStandardMaterial color={pose.helmet ? JACKET : SHIRT} roughness={0.7} /></mesh>
      <mesh ref={set('upR')} castShadow><cylinderGeometry args={[1, 1, 1, 12]} /><meshStandardMaterial color={pose.helmet ? JACKET : SHIRT} roughness={0.7} /></mesh>
      <mesh ref={set('foreL')} castShadow><cylinderGeometry args={[1, 1, 1, 12]} /><meshStandardMaterial color={pose.helmet ? JACKET : SKIN} roughness={0.6} /></mesh>
      <mesh ref={set('foreR')} castShadow><cylinderGeometry args={[1, 1, 1, 12]} /><meshStandardMaterial color={pose.helmet ? JACKET : SKIN} roughness={0.6} /></mesh>
      <Skin color={PANTS} refFn={set('kL')} r={jointR(0.075)} />
      <Skin color={PANTS} refFn={set('kR')} r={jointR(0.075)} />
      <Skin color={pose.helmet ? JACKET : SHIRT} refFn={set('eL')} r={jointR(0.055)} />
      <Skin color={pose.helmet ? JACKET : SHIRT} refFn={set('eR')} r={jointR(0.055)} />
      <Skin color={pose.helmet ? '#3a3a48' : SKIN} refFn={set('hL')} r={jointR(0.05)} />
      <Skin color={pose.helmet ? '#3a3a48' : SKIN} refFn={set('hR')} r={jointR(0.05)} />
      <mesh ref={set('fL')} castShadow scale={[0.07 * s, 0.06 * s, 0.12 * s]}><sphereGeometry args={[1, 14, 10]} /><meshStandardMaterial color={SHOE} roughness={0.5} /></mesh>
      <mesh ref={set('fR')} castShadow scale={[0.07 * s, 0.06 * s, 0.12 * s]}><sphereGeometry args={[1, 14, 10]} /><meshStandardMaterial color={SHOE} roughness={0.5} /></mesh>

      <group ref={head}>
        <mesh castShadow position={[0, 0.02, 0]}><cylinderGeometry args={[0.05, 0.055, 0.08, 12]} /><meshStandardMaterial color={SKIN} /></mesh>
        <mesh castShadow position={[0, 0.15, 0.01]}><sphereGeometry args={[0.13, 28, 22]} /><meshStandardMaterial color={SKIN} roughness={0.55} /></mesh>
        {pose.helmet ? (
          <>
            <mesh castShadow position={[0, 0.17, -0.005]}><sphereGeometry args={[0.165, 28, 22, 0, Math.PI * 2, 0, Math.PI * 0.62]} /><meshPhysicalMaterial color={pose.helmet} clearcoat={1} roughness={0.25} /></mesh>
            <mesh position={[0, 0.15, 0.1]} rotation={[0.3, 0, 0]}><sphereGeometry args={[0.15, 24, 12, -0.9, 1.8, 1.0, 0.6]} /><meshPhysicalMaterial color="#1d2340" roughness={0.05} metalness={0.4} transparent opacity={0.75} /></mesh>
          </>
        ) : (
          <>
            <mesh castShadow position={[0, 0.2, -0.02]}><sphereGeometry args={[0.138, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.55]} /><meshStandardMaterial color={HAIR} roughness={0.9} /></mesh>
            <mesh castShadow position={[0.02, 0.27, 0.05]} rotation={[0.5, 0, 0.3]}><sphereGeometry args={[0.07, 14, 10]} /><meshStandardMaterial color={HAIR} roughness={0.9} /></mesh>
          </>
        )}
        {/* eyes */}
        <mesh position={[0.045, 0.16, 0.125]}><sphereGeometry args={[0.014, 10, 8]} /><meshStandardMaterial color="#1c1a25" /></mesh>
        <mesh position={[-0.045, 0.16, 0.125]}><sphereGeometry args={[0.014, 10, 8]} /><meshStandardMaterial color="#1c1a25" /></mesh>
        {/* cheeks */}
        <mesh position={[0.075, 0.12, 0.1]}><sphereGeometry args={[0.022, 10, 8]} /><meshStandardMaterial color="#ff9fb3" transparent opacity={0.6} /></mesh>
        <mesh position={[-0.075, 0.12, 0.1]}><sphereGeometry args={[0.022, 10, 8]} /><meshStandardMaterial color="#ff9fb3" transparent opacity={0.6} /></mesh>
      </group>

      {pose.backpack && (
        <group ref={pack}>
          <mesh castShadow><boxGeometry args={[0.28, 0.34, 0.16]} /><meshStandardMaterial color="#f2a65a" roughness={0.8} /></mesh>
          <mesh castShadow position={[0, -0.05, -0.09]}><boxGeometry args={[0.2, 0.14, 0.05]} /><meshStandardMaterial color="#e08e45" roughness={0.8} /></mesh>
          <mesh castShadow position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.06, 0.06, 0.34, 14]} /><meshStandardMaterial color="#6fbf9b" roughness={0.8} /></mesh>
        </group>
      )}
    </group>
  )
}

/** The newborn: a swaddled baby tucked into the pram. */
export function Baby() {
  const g = useRef<THREE.Group>(null)
  useFrame((s) => {
    if (g.current) g.current.rotation.z = Math.sin(s.clock.elapsedTime * 1.4) * 0.08
  })
  return (
    <group ref={g}>
      <mesh castShadow scale={[0.13, 0.11, 0.2]}><sphereGeometry args={[1, 20, 16]} /><meshStandardMaterial color="#fff2c7" roughness={0.9} /></mesh>
      <mesh castShadow position={[0, 0.06, 0.17]}><sphereGeometry args={[0.09, 22, 18]} /><meshStandardMaterial color={SKIN} roughness={0.55} /></mesh>
      <mesh position={[0, 0.12, 0.15]}><sphereGeometry args={[0.093, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.4]} /><meshStandardMaterial color="#ffd2e0" /></mesh>
      <mesh position={[0.03, 0.08, 0.25]}><sphereGeometry args={[0.009, 8, 6]} /><meshStandardMaterial color="#1c1a25" /></mesh>
      <mesh position={[-0.03, 0.08, 0.25]}><sphereGeometry args={[0.009, 8, 6]} /><meshStandardMaterial color="#1c1a25" /></mesh>
    </group>
  )
}
