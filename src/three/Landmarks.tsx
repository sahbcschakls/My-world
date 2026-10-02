import * as THREE from 'three'
import { useMemo, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, RoundedBox, Text } from '@react-three/drei'
import fontUrl from '@fontsource/fredoka/files/fredoka-latin-600-normal.woff?url'
import { chapters, type StationId } from '../data/story'
import { usePalette } from '../theme'
import { frameAt, headingOf, ROAD_WIDTH, stationT } from './road'
import { Glow, Paint, Tube } from './parts'

// Local frame for every landmark: +Z runs along the road, +X is the far
// side of the road (away from the camera), -X faces the viewer.
const FACE_CAMERA = -Math.PI / 2

function Label({ children, size = 0.5, color, ...props }: { children: string; size?: number; color?: string } & Record<string, unknown>) {
  const p = usePalette()
  return (
    <Text font={fontUrl} fontSize={size} color={color ?? p.ink} anchorX="center" anchorY="middle" rotation={[0, FACE_CAMERA, 0]} {...props}>
      {children}
    </Text>
  )
}

function Roof({ w, d, h, color, y }: { w: number; d: number; h: number; color: string; y: number }) {
  const geo = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath()
    const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 2 })
    g.translate(0, 0, -d / 2)
    return g
  }, [w, d, h])
  return (
    <mesh geometry={geo} position={[0, y, 0]} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.6} />
    </mesh>
  )
}

/** Windows that light up at night. */
function Window({ position, size = [0.5, 0.6] }: { position: [number, number, number]; size?: [number, number] }) {
  const p = usePalette()
  return (
    <mesh position={position} rotation={[0, FACE_CAMERA, 0]}>
      <planeGeometry args={size} />
      <meshStandardMaterial color={p.lampGlow ? '#ffe3a3' : '#cfe9ff'} emissive="#ffd27a" emissiveIntensity={p.lampGlow * 1.4} roughness={0.1} metalness={0.3} />
    </mesh>
  )
}

function Person({ position, color, rotY = 0, scale = 1 }: { position: [number, number, number]; color: string; rotY?: number; scale?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={scale}>
      <mesh castShadow position={[0, 0.45, 0]}><capsuleGeometry args={[0.16, 0.45, 6, 12]} /><meshStandardMaterial color={color} roughness={0.7} /></mesh>
      <mesh castShadow position={[0, 0.98, 0]}><sphereGeometry args={[0.14, 20, 16]} /><meshStandardMaterial color="#e9b48f" roughness={0.6} /></mesh>
      <mesh castShadow position={[0, 1.04, -0.02]}><sphereGeometry args={[0.145, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} /><meshStandardMaterial color="#3a2a24" roughness={0.9} /></mesh>
    </group>
  )
}

function Bubble({ position, text }: { position: [number, number, number]; text: string }) {
  const p = usePalette()
  return (
    <Float speed={2} floatIntensity={0.6} rotationIntensity={0.1}>
      <group position={position}>
        <RoundedBox args={[0.12, 0.7, 1.6]} radius={0.06}><meshStandardMaterial color={p.paper} roughness={0.5} /></RoundedBox>
        <Label size={0.24} position={[-0.07, 0, 0]}>{text}</Label>
      </group>
    </Float>
  )
}

function Home() {
  const p = usePalette()
  const balloons = useRef<THREE.Group>(null)
  useFrame((s) => { if (balloons.current) balloons.current.position.y = 3.6 + Math.sin(s.clock.elapsedTime) * 0.15 })
  return (
    <group position={[7, 0, 0]}>
      <RoundedBox args={[3.4, 2.4, 3.6]} radius={0.12} position={[0, 1.2, 0]} castShadow receiveShadow><meshStandardMaterial color={p.paper} roughness={0.7} /></RoundedBox>
      <group rotation={[0, Math.PI / 2, 0]}><Roof w={4.2} d={3.6} h={1.6} color={p.pink} y={2.4} /></group>
      <mesh position={[-1.71, 0.8, 0.6]} rotation={[0, FACE_CAMERA, 0]}><planeGeometry args={[0.8, 1.6]} /><meshStandardMaterial color={p.lilac} /></mesh>
      <Window position={[-1.71, 1.4, -0.9]} size={[0.8, 0.7]} />
      <Paint color={p.lemon} position={[-1.2, 4.1, 1.2]}><boxGeometry args={[0.4, 0.8, 0.4]} /></Paint>
      <group ref={balloons} position={[-2.3, 3.6, -1.6]}>
        {[[p.coral, 0, 0], [p.sky, 0.4, 0.5], [p.lemon, -0.3, 0.6], [p.mint, 0.3, -0.5]].map(([c, z, y], i) => (
          <group key={i} position={[0, y as number, z as number]}>
            <Paint color={c as string} scale={[0.32, 0.4, 0.32]}><sphereGeometry args={[1, 24, 18]} /></Paint>
            <Tube from={[0, -0.4, 0]} to={[0, -2.2 - (y as number), -(z as number) * 0.6]} r={0.006} color="#ffffff" metal={0} />
          </group>
        ))}
      </group>
      <Label position={[-1.75, 2.0, 0.6]} size={0.32}>Hello, world!</Label>
    </group>
  )
}

function School() {
  const p = usePalette()
  const flag = useRef<THREE.Mesh>(null)
  useFrame((s) => { if (flag.current) flag.current.rotation.y = Math.sin(s.clock.elapsedTime * 3) * 0.25 })
  return (
    <group position={[8, 0, 0]}>
      <RoundedBox args={[3.4, 3, 7]} radius={0.12} position={[0, 1.5, 0]} castShadow receiveShadow><meshStandardMaterial color={p.peach} roughness={0.7} /></RoundedBox>
      <group rotation={[0, Math.PI / 2, 0]}><Roof w={7.6} d={3.8} h={1.3} color={p.coral} y={3} /></group>
      {[-2.4, -1.2, 1.2, 2.4].map((z) => [1, 2.2].map((y) => <Window key={`${z}${y}`} position={[-1.71, y, z]} />))}
      <mesh position={[-1.71, 0.8, 0]} rotation={[0, FACE_CAMERA, 0]}><planeGeometry args={[1, 1.6]} /><meshStandardMaterial color={p.sky} /></mesh>
      <Glow color={p.paper} intensity={0.4} position={[-1.75, 3.6, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.45, 0.45, 0.1, 32]} /></Glow>
      <Tube from={[-1.82, 3.6, 0]} to={[-1.82, 3.9, 0]} r={0.03} color={p.ink} metal={0} />
      <Tube from={[-1.82, 3.6, 0]} to={[-1.82, 3.6, 0.22]} r={0.03} color={p.ink} metal={0} />
      <Label position={[-1.75, 2.75, 0]} size={0.36}>SCHOOL</Label>
      <Tube from={[-3.5, 0, -3.8]} to={[-3.5, 5, -3.8]} r={0.04} color={p.paper} />
      <mesh ref={flag} position={[-3.5, 4.6, -3.3]} castShadow><boxGeometry args={[0.02, 0.6, 1]} /><meshStandardMaterial color={p.sky} side={THREE.DoubleSide} /></mesh>
    </group>
  )
}

function Tenth() {
  const p = usePalette()
  const books = [p.coral, p.sky, p.lemon, p.mint, p.lilac]
  return (
    <group position={[6, 0, 0]}>
      {books.map((c, i) => (
        <RoundedBox key={i} args={[1.6, 0.42, 2.4]} radius={0.06} position={[0, 0.21 + i * 0.43, 0]} rotation={[0, (i % 2 ? 0.12 : -0.1) + i * 0.05, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={c} roughness={0.7} />
        </RoundedBox>
      ))}
      <Float speed={1.5} floatIntensity={0.8}>
        <group position={[0, 3.4, 0]}>
          <mesh castShadow rotation={[0, 0, 0]}>
            <torusGeometry args={[0.55, 0.12, 16, 40]} />
            <meshPhysicalMaterial color={p.lemon} metalness={0.9} roughness={0.2} clearcoat={1} />
          </mesh>
          <Label position={[-0.05, 0, 0]} size={0.5}>10</Label>
        </group>
      </Float>
      <Label position={[-1.2, 0.5, 2.2]} size={0.3}>Board exams: done</Label>
    </group>
  )
}

/** Branch road + hospital: the road not taken. */
function Fork() {
  const p = usePalette()
  const branch = useMemo(() => {
    const c = new THREE.QuadraticBezierCurve3(new THREE.Vector3(1.5, 0, -3), new THREE.Vector3(6, 0, 1), new THREE.Vector3(14, 0, 2))
    const pts = c.getSpacedPoints(40)
    const pos: number[] = []
    const idx: number[] = []
    pts.forEach((pt, i) => {
      const t = c.getTangentAt(i / 40)
      const n = new THREE.Vector3(-t.z, 0, t.x).multiplyScalar(ROAD_WIDTH * 0.42)
      pos.push(pt.x + n.x, 0.012, pt.z + n.z, pt.x - n.x, 0.012, pt.z - n.z)
      if (i < 40) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2) }
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setIndex(idx)
    g.computeVertexNormals()
    return g
  }, [])
  return (
    <group>
      <mesh geometry={branch} receiveShadow>
        <meshStandardMaterial color={p.road} roughness={0.9} side={THREE.DoubleSide} transparent opacity={0.65} />
      </mesh>
      {/* the hospital, a little faded: respected, not chosen */}
      <group position={[16, 0, 4]}>
        <RoundedBox args={[3.6, 4, 4.4]} radius={0.1} position={[0, 2, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#e8eef3" roughness={0.8} transparent opacity={0.85} />
        </RoundedBox>
        <group position={[-1.82, 3.2, 0]}>
          <mesh rotation={[0, FACE_CAMERA, 0]}><planeGeometry args={[0.9, 0.28]} /><meshStandardMaterial color="#ff7a8a" /></mesh>
          <mesh rotation={[0, FACE_CAMERA, 0]}><planeGeometry args={[0.28, 0.9]} /><meshStandardMaterial color="#ff7a8a" /></mesh>
        </group>
      </group>
      {/* signpost */}
      <group position={[3.2, 0, 1.5]}>
        <Tube from={[0, 0, 0]} to={[0, 3, 0]} r={0.07} color={p.trunk} metal={0} rough={0.9} />
        <group position={[0, 2.5, 0.2]} rotation={[0, 0.5, 0]}>
          <RoundedBox args={[0.1, 0.5, 2.2]} radius={0.04} position={[0, 0, 0.6]} castShadow><meshStandardMaterial color="#e6e3ea" /></RoundedBox>
          <Label position={[-0.07, 0, 0.6]} size={0.24} color="#8a8798">MEDICINE</Label>
        </group>
        <group position={[0, 1.85, -0.1]} rotation={[0, -0.15, 0]}>
          <RoundedBox args={[0.1, 0.6, 2.4]} radius={0.04} position={[0, 0, 0.7]} castShadow><meshStandardMaterial color={p.mint} /></RoundedBox>
          <Label position={[-0.07, 0, 0.7]} size={0.3}>DESIGN</Label>
        </group>
      </group>
    </group>
  )
}

function Design() {
  const p = usePalette()
  const wheel = useRef<THREE.Group>(null)
  useFrame((_, d) => { if (wheel.current) wheel.current.rotation.x += d * 0.3 })
  const swatches = [p.coral, p.peach, p.lemon, p.mint, p.sky, p.lilac, p.pink]
  return (
    <group position={[7, 0, 0]}>
      {/* giant pencil */}
      <group position={[0, 0.5, -2.5]} rotation={[0.35, 0, 0.2]}>
        <Paint color={p.lemon} position={[0, 2, 0]}><cylinderGeometry args={[0.35, 0.35, 4, 6]} /></Paint>
        <mesh castShadow position={[0, -0.3, 0]}><coneGeometry args={[0.35, 0.7, 6]} /><meshStandardMaterial color="#f2d2a9" /></mesh>
        <mesh castShadow position={[0, -0.57, 0]}><coneGeometry args={[0.1, 0.18, 12]} /><meshStandardMaterial color={p.ink} /></mesh>
        <Paint color={p.pink} position={[0, 4.2, 0]}><cylinderGeometry args={[0.35, 0.35, 0.4, 16]} /></Paint>
      </group>
      {/* colour wheel */}
      <group ref={wheel} position={[0.5, 2.6, 2]}>
        {swatches.map((c, i) => (
          <mesh key={i} rotation={[(i / swatches.length) * Math.PI * 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 1.6, 3, 1, false]} />
            <meshPhysicalMaterial color={c} clearcoat={1} roughness={0.3} />
          </mesh>
        ))}
        <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.35, 0.35, 0.25, 32]} /><meshStandardMaterial color={p.paper} /></mesh>
      </group>
      {/* swatch blocks */}
      {swatches.slice(0, 5).map((c, i) => (
        <Float key={i} speed={1 + i * 0.2} floatIntensity={0.5} rotationIntensity={0.6}>
          <RoundedBox args={[0.6, 0.6, 0.6]} radius={0.12} position={[-1.2 + (i % 2) * 0.8, 0.6 + i * 0.5, 4 + i * 0.4]} castShadow>
            <meshPhysicalMaterial color={c} clearcoat={1} roughness={0.25} />
          </RoundedBox>
        </Float>
      ))}
      <Label position={[-1.6, 0.4, 0]} size={0.32}>Design school</Label>
    </group>
  )
}

function Pivot() {
  const p = usePalette()
  return (
    <group position={[7, 0, 0]}>
      {/* a physical product: a chair */}
      <group position={[0, 0, -3]} scale={1.4}>
        <RoundedBox args={[1, 0.15, 1]} radius={0.05} position={[0, 0.9, 0]} castShadow><meshStandardMaterial color={p.peach} /></RoundedBox>
        <RoundedBox args={[0.15, 1, 1]} radius={0.05} position={[0.45, 1.45, 0]} castShadow><meshStandardMaterial color={p.peach} /></RoundedBox>
        {[[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]].map(([x, z], i) => (
          <Tube key={i} from={[x, 0, z]} to={[x * 0.9, 0.85, z * 0.9]} r={0.04} color={p.trunk} metal={0} />
        ))}
      </group>
      <Label position={[-1.5, 0.35, -3]} size={0.26}>product</Label>
      {/* arrow */}
      <Glow color={p.lilac} intensity={0.3} position={[-0.3, 1.6, 0]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.3, 0.6, 3]} /></Glow>
      <Tube from={[-0.3, 1.6, -1.5]} to={[-0.3, 1.6, -0.3]} r={0.08} color={p.lilac} metal={0} />
      {/* digital product: a phone with a glowing UI */}
      <group position={[0, 2.4, 2.6]} rotation={[0, 0, 0.08]}>
        <RoundedBox args={[0.3, 4.2, 2.1]} radius={0.15} smoothness={4} castShadow><meshPhysicalMaterial color={p.ink} clearcoat={1} roughness={0.2} /></RoundedBox>
        <mesh position={[-0.16, 0, 0]} rotation={[0, FACE_CAMERA, 0]}><planeGeometry args={[1.85, 3.9]} /><meshStandardMaterial color={p.paper} emissive={p.paper} emissiveIntensity={0.25} /></mesh>
        {[[1.3, 0.45, p.lilac], [0.6, 0.35, p.mint], [0.05, 0.35, p.pink], [-0.5, 0.35, p.sky], [-1.4, 0.5, p.coral]].map(([y, h, c], i) => (
          <mesh key={i} position={[-0.17, y as number, 0]} rotation={[0, FACE_CAMERA, 0]}>
            <planeGeometry args={[i === 4 ? 1.2 : 1.6, h as number]} />
            <meshStandardMaterial color={c as string} emissive={c as string} emissiveIntensity={0.2} />
          </mesh>
        ))}
      </group>
      <Label position={[-1.5, 0.35, 2.6]} size={0.26}>digital product</Label>
    </group>
  )
}

function Seniors() {
  const p = usePalette()
  return (
    <group position={[7.5, 0, 0]}>
      <RoundedBox args={[4, 3.4, 6]} radius={0.15} position={[1.4, 1.7, 0]} castShadow receiveShadow><meshStandardMaterial color={p.mint} roughness={0.7} /></RoundedBox>
      <mesh position={[-0.61, 1.6, 0]} rotation={[0, FACE_CAMERA, 0]}><planeGeometry args={[4.8, 2.4]} /><meshStandardMaterial color={p.lampGlow ? '#ffe3a3' : '#dff3ff'} emissive="#ffd27a" emissiveIntensity={p.lampGlow} roughness={0.1} /></mesh>
      <Label position={[-0.63, 3.1, 0]} size={0.3}>THE STUDIO</Label>
      {/* table outside with mentors */}
      <RoundedBox args={[1.3, 0.1, 2]} radius={0.04} position={[-2.2, 0.8, 0]} castShadow><meshStandardMaterial color={p.paper} /></RoundedBox>
      <Tube from={[-2.2, 0, 0]} to={[-2.2, 0.8, 0]} r={0.06} color={p.ink} />
      <Person position={[-1.4, 0, -0.6]} color={p.lilac} rotY={-Math.PI / 2} />
      <Person position={[-1.4, 0, 0.6]} color={p.sky} rotY={-Math.PI / 2} />
      <Person position={[-2.2, 0, 1.4]} color={p.coral} rotY={Math.PI} scale={0.9} />
      <Bubble position={[-1.4, 2.3, -0.6]} text="try this!" />
      <Bubble position={[-2.2, 2.3, 1.6]} text="why?" />
    </group>
  )
}

function Clients() {
  const p = usePalette()
  const towers: [number, number, number, string][] = [
    [0, -3, 5, p.sky], [1.8, -1.2, 7, p.lilac], [0.2, 0.8, 4, p.pink], [2, 2.6, 6, p.lemon], [0.4, 4, 3.2, p.mint],
  ]
  return (
    <group position={[7, 0, 0]}>
      {towers.map(([x, z, h, c], i) => (
        <group key={i} position={[x, 0, z]}>
          <RoundedBox args={[1.6, h, 1.6]} radius={0.1} position={[0, h / 2, 0]} castShadow receiveShadow><meshStandardMaterial color={c} roughness={0.6} /></RoundedBox>
          {Array.from({ length: Math.floor(h / 0.9) }, (_, k) => <Window key={k} position={[-0.81, 0.7 + k * 0.85, 0]} size={[0.9, 0.45]} />)}
        </group>
      ))}
      <Float speed={2} floatIntensity={1}>
        <group position={[-1.6, 3.4, -1]}>
          <RoundedBox args={[0.4, 0.9, 1.2]} radius={0.08} castShadow><meshStandardMaterial color={p.trunk} /></RoundedBox>
          <Tube from={[0, 0.45, -0.25]} to={[0, 0.45, 0.25]} r={0.05} color={p.ink} />
        </group>
      </Float>
      <Bubble position={[-1.6, 2.2, 2.4]} text="Ship it!" />
    </group>
  )
}

function Freelance() {
  const p = usePalette()
  const pin = useRef<THREE.Group>(null)
  useFrame((s) => {
    if (!pin.current) return
    pin.current.position.y = 4.4 + Math.sin(s.clock.elapsedTime * 2) * 0.2
    pin.current.rotation.y = s.clock.elapsedTime
  })
  return (
    <group position={[6.5, 0, 0]}>
      {/* tent */}
      <mesh position={[1, 1.1, -1.5]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
        <coneGeometry args={[1.7, 2.2, 4]} />
        <meshStandardMaterial color={p.peach} roughness={0.8} flatShading />
      </mesh>
      {/* campfire */}
      <group position={[-0.8, 0, 1]}>
        {[0, 1, 2].map((i) => <Tube key={i} from={[Math.cos(i * 2.1) * 0.4, 0.05, Math.sin(i * 2.1) * 0.4]} to={[0, 0.35, 0]} r={0.06} color={p.trunk} metal={0} />)}
        <Glow color="#ffb35c" intensity={2.5} position={[0, 0.35, 0]}><coneGeometry args={[0.22, 0.6, 10]} /></Glow>
        <pointLight color="#ffb35c" intensity={p.lampGlow * 6 + 1} distance={7} position={[0, 0.8, 0]} />
      </group>
      {/* map pin: you are here */}
      <group ref={pin} position={[-1, 4.4, 1]}>
        <mesh castShadow><sphereGeometry args={[0.5, 28, 20]} /><meshPhysicalMaterial color={p.coral} clearcoat={1} roughness={0.2} /></mesh>
        <mesh position={[0, -0.6, 0]} rotation={[Math.PI, 0, 0]} castShadow><coneGeometry args={[0.36, 0.9, 24]} /><meshPhysicalMaterial color={p.coral} clearcoat={1} roughness={0.2} /></mesh>
        <mesh><sphereGeometry args={[0.2, 16, 12]} /><meshStandardMaterial color={p.paper} /></mesh>
      </group>
      <Label position={[-1.2, 2.9, 1]} size={0.36}>you are here</Label>
      {/* folded map on the ground */}
      <group position={[-1.5, 0.03, -1.5]} rotation={[-Math.PI / 2, 0, 0.3]}>
        {[0, 1, 2].map((i) => <mesh key={i} position={[i * 0.5 - 0.5, 0, 0]} rotation={[0, i % 2 ? 0.15 : -0.15, 0]}><planeGeometry args={[0.5, 0.8]} /><meshStandardMaterial color={[p.mint, p.lemon, p.sky][i]} side={THREE.DoubleSide} /></mesh>)}
      </group>
    </group>
  )
}

function Next() {
  const p = usePalette()
  const sky: [number, number, number, string][] = [
    [6, -6, 9, p.lilac], [9, -2, 13, p.sky], [6, 3, 7, p.pink], [10, 6, 10, p.mint], [14, -4, 8, p.lemon], [13, 2, 15, p.peach],
  ]
  return (
    <group>
      {sky.map(([x, z, h, c], i) => (
        <group key={i} position={[x, 0, z]}>
          <RoundedBox args={[2.4, h, 2.4]} radius={0.15} position={[0, h / 2, 0]} castShadow receiveShadow><meshStandardMaterial color={c} roughness={0.55} /></RoundedBox>
          {Array.from({ length: Math.floor(h / 1.2) }, (_, k) => <Window key={k} position={[-1.21, 1 + k * 1.15, 0]} size={[1.6, 0.5]} />)}
        </group>
      ))}
      {/* arch over the road */}
      <group position={[0, 0, 4]}>
        <Tube from={[-3, 0, 0]} to={[-3, 4.4, 0]} r={0.14} color={p.paper} />
        <Tube from={[3, 0, 0]} to={[3, 4.4, 0]} r={0.14} color={p.paper} />
        <RoundedBox args={[6.6, 0.9, 0.25]} radius={0.1} position={[0, 4.6, 0]} castShadow><meshPhysicalMaterial color={p.lilac} clearcoat={1} /></RoundedBox>
        <Text font={fontUrl} fontSize={0.45} color={p.ink} position={[0, 4.6, -0.14]} rotation={[0, Math.PI, 0]} anchorX="center" anchorY="middle">NEXT: YOUR TEAM</Text>
        <Text font={fontUrl} fontSize={0.45} color={p.ink} position={[0, 4.6, 0.14]} anchorX="center" anchorY="middle">NEXT: YOUR TEAM</Text>
      </group>
    </group>
  )
}

const LANDMARKS: Record<StationId, () => ReactNode> = {
  home: Home, school: School, tenth: Tenth, fork: Fork, design: Design,
  pivot: Pivot, seniors: Seniors, clients: Clients, freelance: Freelance, next: Next,
}

/** Kilometre stone at each chapter: the travel log. */
function Milestone({ km }: { km: number }) {
  const p = usePalette()
  return (
    <group position={[ROAD_WIDTH / 2 + 0.9, 0, -2.5]}>
      <RoundedBox args={[0.5, 1.1, 0.8]} radius={0.12} position={[0, 0.55, 0]} castShadow receiveShadow><meshStandardMaterial color={p.paper} roughness={0.8} /></RoundedBox>
      <mesh position={[0, 0.98, 0]}><boxGeometry args={[0.52, 0.28, 0.82]} /><meshStandardMaterial color={p.coral} /></mesh>
      <Label position={[-0.27, 0.6, 0]} size={0.2}>{`KM ${km}`}</Label>
    </group>
  )
}

export function Landmarks() {
  return (
    <>
      {chapters.map((c, i) => {
        const f = frameAt(stationT(i))
        const L = LANDMARKS[c.id]
        return (
          <group key={c.id} position={f.point} rotation={[0, headingOf(f.tangent), 0]}>
            <L />
            <Milestone km={i * 12} />
          </group>
        )
      })}
    </>
  )
}
