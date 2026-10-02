import * as THREE from 'three'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { chapters } from '../data/story'
import { usePalette } from '../theme'
import { nearestOnRoad, frameAt, headingOf, road, ROAD_LENGTH, ROAD_WIDTH, rng, stationT } from './road'

const center = new THREE.Vector3()
road.getPoint(0.5, center)

/** Asphalt ribbon, kerbs and dashed centre line. */
export function Road() {
  const p = usePalette()
  const { asphalt, dashes, kerbs } = useMemo(() => {
    const N = 900
    const strip = (half: number, y: number, keep: (i: number) => boolean, offset = 0) => {
      const pos: number[] = [], idx: number[] = []
      const f = { point: new THREE.Vector3(), tangent: new THREE.Vector3(), right: new THREE.Vector3() }
      let v = 0
      for (let i = 0; i < N; i++) {
        if (!keep(i)) continue
        for (const t of [i / N, (i + 1) / N]) {
          frameAt(t, f)
          const c = f.point.clone().addScaledVector(f.right, offset)
          pos.push(c.x + f.right.x * half, y, c.z + f.right.z * half, c.x - f.right.x * half, y, c.z - f.right.z * half)
        }
        idx.push(v, v + 1, v + 2, v + 1, v + 3, v + 2)
        v += 4
      }
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
      g.setIndex(idx)
      g.computeVertexNormals()
      return g
    }
    const merge = (a: THREE.BufferGeometry, b: THREE.BufferGeometry) => {
      const pa = a.getAttribute('position').array as Float32Array, pb = b.getAttribute('position').array as Float32Array
      const ia = Array.from(a.getIndex()!.array), ib = Array.from(b.getIndex()!.array)
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.Float32BufferAttribute([...pa, ...pb], 3))
      g.setIndex([...ia, ...ib.map((i) => i + pa.length / 3)])
      g.computeVertexNormals()
      return g
    }
    return {
      asphalt: strip(ROAD_WIDTH / 2, 0.01, () => true),
      dashes: strip(0.07, 0.02, (i) => i % 6 < 3),
      kerbs: merge(strip(0.18, 0.03, () => true, ROAD_WIDTH / 2 + 0.1), strip(0.18, 0.03, () => true, -ROAD_WIDTH / 2 - 0.1)),
    }
  }, [])
  return (
    <group>
      <mesh geometry={asphalt} receiveShadow><meshStandardMaterial color={p.road} roughness={0.92} side={THREE.DoubleSide} /></mesh>
      <mesh geometry={dashes}><meshStandardMaterial color={p.roadLine} emissive={p.roadLine} emissiveIntensity={p.lampGlow * 0.3} side={THREE.DoubleSide} /></mesh>
      <mesh geometry={kerbs} receiveShadow><meshStandardMaterial color={p.roadEdge} roughness={0.7} side={THREE.DoubleSide} /></mesh>
    </group>
  )
}

export function Ground() {
  const p = usePalette()
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[center.x, 0, center.z]} receiveShadow>
        <circleGeometry args={[ROAD_LENGTH * 1.2, 96]} />
        <meshStandardMaterial color={p.ground} roughness={1} />
      </mesh>
      {/* a lake for the traveller to ride past */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[center.x + 32, 0.02, center.z - 40]} scale={[1.6, 1, 1]}>
        <circleGeometry args={[14, 64]} />
        <meshPhysicalMaterial color={p.water} roughness={0.08} metalness={0.1} clearcoat={1} />
      </mesh>
    </group>
  )
}

/** Instanced lollipop trees and bushes, kept clear of the road and the landmarks. */
export function Trees() {
  const p = usePalette()
  const trunks = useRef<THREE.InstancedMesh>(null)
  const crowns = useRef<THREE.InstancedMesh>(null)
  const items = useMemo(() => {
    const r = rng(7)
    const stations = chapters.map((_, i) => frameAt(stationT(i)))
    const out: { x: number; z: number; s: number; c: number }[] = []
    let guard = 0
    while (out.length < 420 && guard++ < 20000) {
      const x = center.x + (r() - 0.5) * 260
      const z = center.z + (r() - 0.5) * ROAD_LENGTH * 1.3
      const { d, side } = nearestOnRoad(x, z)
      if (d < ROAD_WIDTH / 2 + 2.2) continue
      // Keep the camera's side of the road open so trees never block the rider.
      if (side > 0 && d < 16) continue
      // Keep a clear stage around each landmark (they sit on the far side).
      if (stations.some((f) => Math.hypot(f.point.x - f.right.x * 9 - x, f.point.z - f.right.z * 9 - z) < 10)) continue
      out.push({ x, z, s: 0.7 + r() * 0.9, c: Math.floor(r() * p.leaf.length) })
    }
    return out
  }, [])

  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), v = new THREE.Vector3()
    const col = new THREE.Color()
    items.forEach((t, i) => {
      v.set(t.x, 0.6 * t.s, t.z); s.set(t.s, t.s, t.s)
      trunks.current?.setMatrixAt(i, m.compose(v, q, s))
      v.set(t.x, 1.75 * t.s, t.z); s.set(t.s * 1.15, t.s * 1.25, t.s * 1.15)
      crowns.current?.setMatrixAt(i, m.compose(v, q, s))
      crowns.current?.setColorAt(i, col.set(p.leaf[t.c]))
    })
    if (trunks.current) trunks.current.instanceMatrix.needsUpdate = true
    if (crowns.current) {
      crowns.current.instanceMatrix.needsUpdate = true
      if (crowns.current.instanceColor) crowns.current.instanceColor.needsUpdate = true
    }
  }, [items, p])

  return (
    <group>
      <instancedMesh ref={trunks} args={[undefined, undefined, items.length]} castShadow>
        <cylinderGeometry args={[0.1, 0.16, 1.2, 8]} />
        <meshStandardMaterial color={p.trunk} roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={crowns} args={[undefined, undefined, items.length]} castShadow>
        <icosahedronGeometry args={[0.8, 2]} />
        <meshStandardMaterial roughness={0.75} />
      </instancedMesh>
    </group>
  )
}

/** Wildflowers dotted along both verges. */
export function Flowers() {
  const p = usePalette()
  const ref = useRef<THREE.InstancedMesh>(null)
  const count = 900
  useLayoutEffect(() => {
    const r = rng(42)
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), v = new THREE.Vector3()
    const col = new THREE.Color()
    const f = frameAt(0)
    const colors = [p.pink, p.lemon, p.paper, p.lilac, p.peach]
    for (let i = 0; i < count; i++) {
      frameAt(r(), f)
      const side = r() < 0.5 ? -1 : 1
      const off = side * (ROAD_WIDTH / 2 + 0.6 + r() * 3)
      v.copy(f.point).addScaledVector(f.right, off).setY(0.08)
      s.setScalar(0.06 + r() * 0.06)
      ref.current?.setMatrixAt(i, m.compose(v, q, s))
      ref.current?.setColorAt(i, col.set(colors[i % colors.length]))
    }
    if (ref.current) {
      ref.current.instanceMatrix.needsUpdate = true
      if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true
    }
  }, [p])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 6]} />
      <meshStandardMaterial roughness={0.6} emissiveIntensity={0} />
    </instancedMesh>
  )
}

/** Street lamps on the far verge. They glow in dark mode. */
export function Lamps() {
  const p = usePalette()
  const spots = useMemo(() => {
    const out: { pos: THREE.Vector3; rot: number }[] = []
    for (let t = 0.02; t < 1; t += 0.035) {
      const f = frameAt(t)
      out.push({ pos: f.point.clone().addScaledVector(f.right, -(ROAD_WIDTH / 2 + 0.6)), rot: headingOf(f.tangent) })
    }
    return out
  }, [])
  return (
    <group>
      {spots.map((s, i) => (
        <group key={i} position={s.pos} rotation={[0, s.rot, 0]}>
          <mesh castShadow position={[0, 1.6, 0]}><cylinderGeometry args={[0.04, 0.06, 3.2, 8]} /><meshStandardMaterial color={p.ink} roughness={0.5} metalness={0.4} /></mesh>
          <mesh position={[-0.25, 3.2, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.03, 0.03, 0.5, 8]} /><meshStandardMaterial color={p.ink} /></mesh>
          <mesh position={[-0.5, 3.1, 0]}>
            <sphereGeometry args={[0.14, 16, 12]} />
            <meshStandardMaterial color="#fff1c4" emissive="#ffd88a" emissiveIntensity={0.2 + p.lampGlow * 3} toneMapped={false} />
          </mesh>
          {p.lampGlow > 0 && (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.8, 0.025, 0]}>
              <circleGeometry args={[1.6, 32]} />
              <meshBasicMaterial color="#ffd88a" transparent opacity={0.16} depthWrite={false} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  )
}

export function Mountains() {
  const p = usePalette()
  const peaks = useMemo(() => {
    const r = rng(3)
    return Array.from({ length: 34 }, (_, i) => {
      const a = (i / 34) * Math.PI * 2 + r() * 0.1
      const R = ROAD_LENGTH * 0.75 + r() * 60
      return { x: center.x + Math.cos(a) * R, z: center.z + Math.sin(a) * R, h: 40 + r() * 60, w: 40 + r() * 40, c: i % 3 }
    })
  }, [])
  return (
    <group>
      {peaks.map((m, i) => (
        <group key={i} position={[m.x, 0, m.z]}>
          <mesh position={[0, m.h / 2, 0]}>
            <coneGeometry args={[m.w, m.h, 7]} />
            <meshStandardMaterial color={p.mountain[m.c]} roughness={1} flatShading />
          </mesh>
          <mesh position={[0, m.h * 0.88, 0]}>
            <coneGeometry args={[m.w * 0.24, m.h * 0.24, 7]} />
            <meshStandardMaterial color={p.paper} roughness={1} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function Clouds() {
  const p = usePalette()
  const group = useRef<THREE.Group>(null)
  const clouds = useMemo(() => {
    const r = rng(11)
    return Array.from({ length: 26 }, () => ({
      x: center.x + (r() - 0.5) * 300,
      y: 22 + r() * 18,
      z: center.z + (r() - 0.5) * ROAD_LENGTH * 1.2,
      s: 2 + r() * 3,
      puffs: Array.from({ length: 4 + Math.floor(r() * 3) }, (_, k) => [k * 1.1 - 2, r() * 0.6, (r() - 0.5) * 1.2, 0.9 + r() * 0.8] as const),
    }))
  }, [])
  useFrame((_, d) => {
    group.current?.children.forEach((c, i) => {
      c.position.x += d * (0.4 + (i % 3) * 0.2)
      if (c.position.x > center.x + 160) c.position.x = center.x - 160
    })
  })
  return (
    <group ref={group}>
      {clouds.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]} scale={c.s}>
          {c.puffs.map(([x, y, z, s], k) => (
            <mesh key={k} position={[x, y, z]} scale={s}>
              <sphereGeometry args={[1, 16, 12]} />
              <meshStandardMaterial color={p.cloud} roughness={1} transparent opacity={0.92} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

/** Gradient sky dome. */
export function SkyDome() {
  const p = usePalette()
  const mat = useMemo(() => new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: { top: { value: new THREE.Color() }, bottom: { value: new THREE.Color() } },
    vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
    fragmentShader: `uniform vec3 top; uniform vec3 bottom; varying vec3 vP;
      void main(){ float h = clamp(vP.y * 1.6 + 0.15, 0., 1.); gl_FragColor = vec4(mix(bottom, top, smoothstep(0.,1.,h)), 1.); }`,
  }), [])
  const targetTop = useMemo(() => new THREE.Color(), [])
  const targetBottom = useMemo(() => new THREE.Color(), [])
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ camera }, d) => {
    targetTop.set(p.skyTop); targetBottom.set(p.skyBottom)
    const k = 1 - Math.exp(-d * 4)
    mat.uniforms.top.value.lerp(targetTop, k)
    mat.uniforms.bottom.value.lerp(targetBottom, k)
    ref.current?.position.copy(camera.position)
  })
  return (
    <mesh ref={ref} material={mat} renderOrder={-1}>
      <sphereGeometry args={[400, 32, 16]} />
    </mesh>
  )
}
