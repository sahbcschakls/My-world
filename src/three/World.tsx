import * as THREE from 'three'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, Sparkles, Stars } from '@react-three/drei'
import { chapters, type VehicleId } from '../data/story'
import { chapterAt, journey } from '../store'
import { usePalette } from '../theme'
import { frameAt, headingOf, roadT, ROAD_LENGTH, type Frame } from './road'
import { Vehicle } from './Vehicles'
import { Landmarks } from './Landmarks'
import { Clouds, Flowers, Ground, Lamps, Mountains, Road, SkyDome, Trees } from './Scenery'

const damp = THREE.MathUtils.damp
const SUN_OFFSET = new THREE.Vector3(-14, 22, 10)
const MID = frameAt(0.5).point
const LOOK_ACROSS = 2.4

/** Advances the smoothed journey state once per frame. */
function JourneyDriver() {
  useFrame((_, dt) => {
    const d = Math.min(dt, 1 / 8)
    const prev = journey.progress
    journey.progress = damp(journey.progress, journey.target, 3.2, d)
    const dp = journey.progress - prev
    journey.velocity = damp(journey.velocity, dp / Math.max(d, 1e-4), 6, d)
    // Distance in world units along the road (for wheels & pedals).
    journey.distance += dp * ROAD_LENGTH * 0.94
  })
  return null
}

/** The rider: follows the road and swaps vehicles at chapter boundaries. */
function Traveller({ frame }: { frame: Frame }) {
  const group = useRef<THREE.Group>(null)
  const swap = useRef<THREE.Group>(null)
  const puff = useRef<THREE.Group>(null)
  const [vehicle, setVehicle] = useState<VehicleId>(chapters[0].vehicle)
  const pop = useRef(1)
  const lean = useRef(0)
  const lastHeading = useRef(0)

  useFrame((state, dt) => {
    const d = Math.min(dt, 1 / 8)
    const v = chapters[chapterAt(journey.progress)].vehicle
    if (v !== vehicle) { setVehicle(v); pop.current = 0 }

    frameAt(roadT(journey.progress), frame)
    const g = group.current
    if (!g) return
    // Ride slightly left of centre, like a real road.
    g.position.copy(frame.point).addScaledVector(frame.right, -0.6)
    const h = headingOf(frame.tangent)
    let dh = h - lastHeading.current
    if (dh > Math.PI) dh -= Math.PI * 2
    if (dh < -Math.PI) dh += Math.PI * 2
    lastHeading.current = h
    g.rotation.y = h
    // Lean into curves when moving (bikes do, prams don't).
    const canLean = v !== 'stroller' && v !== 'tricycle' && v !== 'car'
    const target = canLean ? THREE.MathUtils.clamp(-dh / Math.max(d, 1e-4) * 0.6, -0.3, 0.3) : 0
    lean.current = damp(lean.current, target, 5, d)
    g.rotation.z = lean.current

    // Pop-in animation for the new vehicle (springy overshoot).
    pop.current = Math.min(1, pop.current + d * 1.8)
    const t = pop.current
    const s = t < 1 ? 1 + Math.sin(t * Math.PI * 1.5) * (1 - t) * 0.35 - (1 - t) ** 3 : 1
    swap.current?.scale.setScalar(Math.max(0.001, s))
    if (puff.current) {
      puff.current.visible = t < 1
      puff.current.children.forEach((c, i) => {
        const a = (i / puff.current!.children.length) * Math.PI * 2
        const r = 0.3 + t * 1.6
        c.position.set(Math.cos(a) * r, 0.2 + t * 0.6 + (i % 2) * 0.2, Math.sin(a) * r)
        c.scale.setScalar(0.35 * (1 - t))
      })
    }
    // A tiny idle bounce while stationary keeps the scene alive.
    if (swap.current) swap.current.position.y = Math.abs(Math.sin(state.clock.elapsedTime * 3)) * 0.01 * (1 - Math.min(1, Math.abs(journey.velocity) * 10))
  })

  return (
    <group ref={group}>
      <group ref={swap}>
        <Vehicle id={vehicle} />
      </group>
      <group ref={puff}>
        {Array.from({ length: 10 }, (_, i) => (
          <mesh key={i}><sphereGeometry args={[1, 12, 10]} /><meshStandardMaterial color="#ffffff" transparent opacity={0.85} roughness={1} /></mesh>
        ))}
      </group>
    </group>
  )
}

/** Third-person camera that frames the rider, with per-chapter framing. */
function CameraRig({ frame }: { frame: Frame }) {
  const { camera, size } = useThree()
  const look = useMemo(() => new THREE.Vector3(), [])
  const want = useMemo(() => new THREE.Vector3(), [])
  const off = useMemo(() => new THREE.Vector3(...chapters[0].camera), [])
  const offTarget = useMemo(() => new THREE.Vector3(), [])
  const ahead = useMemo(() => ({ point: new THREE.Vector3(), tangent: new THREE.Vector3(), right: new THREE.Vector3() }), [])
  const pointer = useThree((s) => s.pointer)

  useFrame((_, dt) => {
    const d = Math.min(dt, 1 / 8)
    // Blend camera framing between neighbouring chapters.
    const x = journey.progress * chapters.length - 0.5
    const i = THREE.MathUtils.clamp(Math.floor(x), 0, chapters.length - 1)
    const j = Math.min(chapters.length - 1, i + 1)
    const k = THREE.MathUtils.smoothstep(x - i, 0.55, 1)
    offTarget.fromArray(chapters[i].camera).lerp(want.fromArray(chapters[j].camera), x < 0 ? 0 : k)
    // Portrait screens need a wider view.
    const portrait = size.width < size.height
    if (portrait) offTarget.multiplyScalar(1.7)
    off.x = damp(off.x, offTarget.x, 2, d); off.y = damp(off.y, offTarget.y, 2, d); off.z = damp(off.z, offTarget.z, 2, d)

    frameAt(roadT(journey.progress + 0.01), ahead)
    want.copy(frame.point)
      .addScaledVector(frame.right, off.x + pointer.x * 0.6)
      .addScaledVector(frame.tangent, -off.z)
    want.y = off.y + pointer.y * 0.3
    camera.position.x = damp(camera.position.x, want.x, 4, d)
    camera.position.y = damp(camera.position.y, want.y, 4, d)
    camera.position.z = damp(camera.position.z, want.z, 4, d)

    // Aim between the rider and the landmark across the road, so both are in frame.
    look.lerpVectors(frame.point, ahead.point, portrait ? 0 : 0.5).addScaledVector(frame.right, portrait ? 0 : -LOOK_ACROSS)
    // On tall screens the story card covers the bottom, so lift the rider up.
    look.y = portrait ? -0.6 : 1.2
    camera.lookAt(look)
  })
  return null
}

/** Sun (or moon) light that follows the rider so shadows stay crisp. */
function Lights({ frame }: { frame: Frame }) {
  const p = usePalette()
  const sun = useRef<THREE.DirectionalLight>(null)
  const hemi = useRef<THREE.HemisphereLight>(null)
  const amb = useRef<THREE.AmbientLight>(null)
  const col = useMemo(() => new THREE.Color(), [])
  useEffect(() => {
    if (sun.current) sun.current.target.position.set(0, 0, 0)
  }, [])
  useFrame((_, dt) => {
    const k = 1 - Math.exp(-dt * 4)
    const s = sun.current
    if (s) {
      s.position.copy(frame.point).add(SUN_OFFSET)
      s.target.position.copy(frame.point)
      s.target.updateMatrixWorld()
      s.intensity = damp(s.intensity, p.sunIntensity, 4, dt)
      s.color.lerp(col.set(p.sun), k)
    }
    if (amb.current) {
      amb.current.intensity = damp(amb.current.intensity, p.ambientIntensity, 4, dt)
      amb.current.color.lerp(col.set(p.ambient), k)
    }
    if (hemi.current) {
      hemi.current.color.lerp(col.set(p.skyTop), k)
      hemi.current.groundColor.lerp(col.set(p.hemiGround), k)
    }
  })
  return (
    <>
      <ambientLight ref={amb} intensity={0.5} />
      <hemisphereLight ref={hemi} intensity={0.6} />
      <directionalLight
        ref={sun}
        castShadow
        intensity={2}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-camera-near={1}
        shadow-camera-far={80}
      />
    </>
  )
}

function Atmosphere() {
  const p = usePalette()
  const { scene } = useThree()
  const fog = useMemo(() => new THREE.Fog(p.fog, 40, 220), [])
  const col = useMemo(() => new THREE.Color(), [])
  useEffect(() => { scene.fog = fog; return () => { scene.fog = null } }, [scene, fog])
  useFrame((_, dt) => { fog.color.lerp(col.set(p.fog), 1 - Math.exp(-dt * 4)) })
  return null
}

/** Shadow blob directly under the rider, for grounding at any distance. */
function RiderShadow({ frame }: { frame: Frame }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(() => { ref.current?.position.set(frame.point.x - frame.right.x * 0.6, 0.03, frame.point.z - frame.right.z * 0.6) })
  return (
    <group ref={ref}>
      <ContactShadows scale={6} blur={2.2} far={2} opacity={0.45} resolution={256} frames={Infinity} />
    </group>
  )
}

export function World() {
  const p = usePalette()
  // Shared, mutable frame of the rider, written by Traveller each frame.
  const frame = useMemo<Frame>(() => frameAt(0), [])
  return (
    <>
      <JourneyDriver />
      <Atmosphere />
      <SkyDome />
      <Lights frame={frame} />
      {/* Studio-style reflections without loading an HDR from the network. */}
      <Environment key={p.skyTop} resolution={256} frames={1}>
        <Lightformer intensity={2} color={p.skyTop} position={[0, 5, -9]} scale={[10, 10, 1]} />
        <Lightformer intensity={1.5} color={p.pink} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[10, 2, 1]} />
        <Lightformer intensity={1.5} color={p.mint} position={[5, 1, -1]} rotation-y={-Math.PI / 2} scale={[10, 2, 1]} />
        <Lightformer intensity={1} color="#ffffff" position={[0, -5, 0]} rotation-x={Math.PI / 2} scale={[20, 20, 1]} />
      </Environment>
      {p.lampGlow > 0 && <Stars radius={300} depth={60} count={2500} factor={6} fade speed={0.6} />}
      {p.lampGlow > 0 && <Sparkles count={160} scale={[200, 6, 400]} position={[MID.x, 3, MID.z]} size={3} speed={0.3} color="#ffe9a8" />}
      <Ground />
      <Road />
      <Lamps />
      <Trees />
      <Flowers />
      <Mountains />
      <Clouds />
      <Landmarks />
      <Traveller frame={frame} />
      <RiderShadow frame={frame} />
      <CameraRig frame={frame} />
    </>
  )
}
