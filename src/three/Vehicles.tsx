import { RoundedBox } from '@react-three/drei'
import type { VehicleId } from '../data/story'
import { usePalette } from '../theme'
import { Baby, Rider, type Pose } from './Avatar'
import { Glow, Paint, Tube, Wheel } from './parts'

// Every vehicle faces +Z and sits on the ground at y = 0.

const CHROME = '#dfe3ee'
const DARK = '#34324a'

function Saddle({ y, z, w = 0.1 }: { y: number; z: number; w?: number }) {
  return (
    <mesh castShadow position={[0, y, z]} scale={[w, 0.035, 0.15]}>
      <sphereGeometry args={[1, 16, 10]} />
      <meshStandardMaterial color={DARK} roughness={0.6} />
    </mesh>
  )
}

function Grip({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <mesh position={[x, y, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[0.022, 0.022, 0.1, 10]} />
      <meshStandardMaterial color={DARK} roughness={0.7} />
    </mesh>
  )
}

export function Stroller() {
  const p = usePalette()
  return (
    <group>
      {[[-0.22, 0.12, 0.3], [0.22, 0.12, 0.3], [-0.22, 0.14, -0.3], [0.22, 0.14, -0.3]].map((w, i) => (
        <Wheel key={i} position={w as [number, number, number]} r={i < 2 ? 0.12 : 0.14} w={0.04} rim={p.paper} spokes={6} />
      ))}
      <Tube from={[-0.22, 0.13, 0.3]} to={[-0.2, 0.5, 0]} color={CHROME} r={0.015} />
      <Tube from={[0.22, 0.13, 0.3]} to={[0.2, 0.5, 0]} color={CHROME} r={0.015} />
      <Tube from={[-0.22, 0.14, -0.3]} to={[-0.2, 0.5, 0]} color={CHROME} r={0.015} />
      <Tube from={[0.22, 0.14, -0.3]} to={[0.2, 0.5, 0]} color={CHROME} r={0.015} />
      <Tube from={[-0.2, 0.55, -0.25]} to={[-0.22, 0.95, -0.55]} color={CHROME} r={0.015} />
      <Tube from={[0.2, 0.55, -0.25]} to={[0.22, 0.95, -0.55]} color={CHROME} r={0.015} />
      <Tube from={[-0.24, 0.95, -0.55]} to={[0.24, 0.95, -0.55]} color={DARK} r={0.022} />
      {/* bassinet */}
      <Paint color={p.pink} position={[0, 0.62, 0]} scale={[0.26, 0.2, 0.38]}>
        <sphereGeometry args={[1, 32, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
      </Paint>
      {/* hood */}
      <Paint color={p.lilac} position={[0, 0.62, -0.12]} rotation={[-0.5, 0, 0]} scale={[0.27, 0.27, 0.27]}>
        <sphereGeometry args={[1, 32, 16, 0, Math.PI, 0, Math.PI / 2]} />
      </Paint>
      <group position={[0, 0.66, 0.03]}><Baby /></group>
    </group>
  )
}

export function Tricycle() {
  const p = usePalette()
  const pose: Pose = { size: 0.6, hip: [0.44, -0.1], hand: [0.17, 0.66, 0.24], feet: { crank: [0.27, 0.4], r: 0.08 }, lean: 0.1 }
  return (
    <group>
      <Wheel position={[0, 0.27, 0.4]} r={0.27} w={0.06} rim={p.paper} />
      <Wheel position={[-0.27, 0.15, -0.28]} r={0.15} w={0.05} rim={p.paper} />
      <Wheel position={[0.27, 0.15, -0.28]} r={0.15} w={0.05} rim={p.paper} />
      <Tube from={[-0.3, 0.15, -0.28]} to={[0.3, 0.15, -0.28]} color={CHROME} r={0.018} />
      <Tube from={[0, 0.17, -0.28]} to={[0, 0.33, -0.05]} color={p.coral} r={0.035} metal={0.1} />
      <Tube from={[0, 0.33, -0.05]} to={[0, 0.58, 0.3]} color={p.coral} r={0.035} metal={0.1} />
      <Tube from={[0, 0.62, 0.3]} to={[0, 0.27, 0.4]} color={p.coral} r={0.025} metal={0.1} />
      <Tube from={[0, 0.58, 0.3]} to={[0, 0.66, 0.25]} color={CHROME} r={0.018} />
      <Tube from={[-0.17, 0.66, 0.24]} to={[0.17, 0.66, 0.24]} color={CHROME} r={0.015} />
      <Grip x={0.17} y={0.66} z={0.24} /><Grip x={-0.17} y={0.66} z={0.24} />
      <Paint color={p.pink} position={[0, 0.4, -0.1]} scale={[0.13, 0.04, 0.12]}><sphereGeometry args={[1, 16, 10]} /></Paint>
      {/* back step + little bell */}
      <Paint color={p.lemon} position={[0, 0.2, -0.42]}><boxGeometry args={[0.4, 0.03, 0.14]} /></Paint>
      <Paint color={p.lemon} position={[0.11, 0.69, 0.25]}><sphereGeometry args={[0.03, 12, 10]} /></Paint>
      <Rider pose={pose} />
    </group>
  )
}

export function Bicycle({ geared = false }: { geared?: boolean }) {
  const p = usePalette()
  const color = geared ? p.mint : p.lemon
  const r = geared ? 0.35 : 0.33
  const pose: Pose = geared
    ? { size: 0.95, hip: [0.88, -0.16], hand: [0.2, 0.9, 0.42], feet: { crank: [0.3, 0], r: 0.17 }, lean: 0.55 }
    : { size: 0.82, hip: [0.78, -0.13], hand: [0.24, 0.94, 0.33], feet: { crank: [0.3, 0], r: 0.15 }, lean: 0.25 }
  const seat: [number, number, number] = [0, geared ? 0.8 : 0.74, -0.13]
  const head: [number, number, number] = [0, geared ? 0.86 : 0.84, 0.42]
  return (
    <group>
      <Wheel position={[0, r, 0.52]} r={r} w={geared ? 0.03 : 0.05} rim={CHROME} spokes={16} />
      <Wheel position={[0, r, -0.52]} r={r} w={geared ? 0.03 : 0.05} rim={CHROME} spokes={16} />
      {/* frame */}
      <Tube from={[0, 0.3, 0]} to={seat} color={color} r={0.026} metal={0.2} />
      <Tube from={[0, 0.3, 0]} to={[0, 0.7, 0.45]} color={color} r={0.03} metal={0.2} />
      <Tube from={[0, seat[1] - 0.05, -0.11]} to={head} color={color} r={0.024} metal={0.2} />
      <Tube from={[0, 0.3, 0]} to={[0, r, -0.52]} color={color} r={0.018} metal={0.2} />
      <Tube from={[0, seat[1] - 0.04, -0.12]} to={[0, r, -0.52]} color={color} r={0.016} metal={0.2} />
      <Tube from={[0, head[1], 0.42]} to={[0, r, 0.52]} color={CHROME} r={0.02} />
      <Tube from={seat} to={[0, seat[1] + 0.05, -0.14]} color={CHROME} r={0.014} />
      <Saddle y={seat[1] + 0.07} z={-0.15} w={geared ? 0.07 : 0.1} />
      {/* bars */}
      <Tube from={head} to={[0, head[1] + 0.08, head[2] - 0.04]} color={CHROME} r={0.016} />
      {geared ? (
        <>
          <Tube from={[-0.2, 0.94, 0.38]} to={[0.2, 0.94, 0.38]} color={CHROME} r={0.014} />
          <Tube from={[0.2, 0.94, 0.38]} to={[0.2, 0.88, 0.46]} color={DARK} r={0.016} metal={0.1} />
          <Tube from={[-0.2, 0.94, 0.38]} to={[-0.2, 0.88, 0.46]} color={DARK} r={0.016} metal={0.1} />
        </>
      ) : (
        <>
          <Tube from={[-0.24, 0.94, 0.33]} to={[0.24, 0.94, 0.33]} color={CHROME} r={0.014} />
          <Grip x={0.24} y={0.94} z={0.33} /><Grip x={-0.24} y={0.94} z={0.33} />
          {/* basket for a school bag */}
          <mesh castShadow position={[0, 0.82, 0.6]}><boxGeometry args={[0.3, 0.18, 0.22]} /><meshStandardMaterial color={p.peach} roughness={0.8} wireframe={false} /></mesh>
        </>
      )}
      {/* drivetrain */}
      <mesh position={[-0.05, 0.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[geared ? 0.11 : 0.09, geared ? 0.11 : 0.09, 0.012, 28]} />
        <meshStandardMaterial color={CHROME} metalness={0.9} roughness={0.25} />
      </mesh>
      <Tube from={[-0.05, 0.3 + 0.1, 0]} to={[-0.05, r + 0.04, -0.52]} color="#55526a" r={0.006} />
      <Tube from={[-0.05, 0.3 - 0.1, 0]} to={[-0.05, r - 0.04, -0.52]} color="#55526a" r={0.006} />
      {geared &&
        [0.07, 0.06, 0.05, 0.04, 0.032].map((cr, i) => (
          <mesh key={i} position={[-0.05 - i * 0.008, r, -0.52]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[cr, cr, 0.005, 24]} />
            <meshStandardMaterial color={CHROME} metalness={0.95} roughness={0.2} />
          </mesh>
        ))}
      {geared && <mesh position={[-0.08, r - 0.1, -0.5]}><boxGeometry args={[0.02, 0.1, 0.05]} /><meshStandardMaterial color={DARK} /></mesh>}
      {/* pedals */}
      <Tube from={[0.11, 0.3, 0]} to={[-0.11, 0.3, 0]} color={CHROME} r={0.012} />
      <Rider pose={pose} />
    </group>
  )
}

export function Moped() {
  const p = usePalette()
  const pose: Pose = { size: 1, hip: [0.78, -0.25], hand: [0.3, 1.04, 0.36], feet: { rest: [0.14, 0.32, 0.0] }, lean: 0.12, helmet: p.paper }
  return (
    <group>
      <Wheel position={[0, 0.28, 0.62]} r={0.28} w={0.06} rim={CHROME} spokes={18} />
      <Wheel position={[0, 0.28, -0.6]} r={0.28} w={0.06} rim={CHROME} spokes={18} />
      {/* step-through spine */}
      <Tube from={[0, 1.0, 0.42]} to={[0, 0.36, 0.1]} color={p.peach} r={0.05} metal={0.1} />
      <Tube from={[0, 0.36, 0.1]} to={[0, 0.45, -0.3]} color={p.peach} r={0.05} metal={0.1} />
      <Paint color={p.peach} position={[0, 0.58, -0.3]} scale={[0.17, 0.16, 0.3]}><sphereGeometry args={[1, 24, 16]} /></Paint>
      <Paint color={p.paper} position={[0, 0.3, -0.15]}><boxGeometry args={[0.18, 0.16, 0.28]} /></Paint>
      <Tube from={[0, 1.02, 0.44]} to={[0, 0.28, 0.62]} color={CHROME} r={0.022} />
      <Tube from={[0, 0.28, -0.6]} to={[0, 0.45, -0.25]} color={CHROME} r={0.018} />
      {/* mudguards */}
      <Paint color={p.peach} position={[0, 0.3, 0.62]} rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[0.31, 0.03, 8, 24, Math.PI * 0.9]} /></Paint>
      <Saddle y={0.82} z={-0.28} w={0.13} />
      <Paint color={p.lemon} position={[0, 0.82, -0.62]}><boxGeometry args={[0.24, 0.03, 0.26]} /></Paint>
      <Tube from={[-0.3, 1.04, 0.36]} to={[0.3, 1.04, 0.36]} color={CHROME} r={0.016} />
      <Grip x={0.3} y={1.04} z={0.36} /><Grip x={-0.3} y={1.04} z={0.36} />
      <Glow position={[0, 0.98, 0.52]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.07, 0.07, 0.04, 20]} /></Glow>
      <Tube from={[0.14, 0.32, 0]} to={[-0.14, 0.32, 0]} color={DARK} r={0.015} />
      <Rider pose={pose} />
    </group>
  )
}

export function Scooter() {
  const p = usePalette()
  const pose: Pose = { size: 1, hip: [0.8, -0.3], hand: [0.3, 1.06, 0.38], feet: { rest: [0.13, 0.36, 0.1] }, lean: 0.05, helmet: p.lilac }
  return (
    <group>
      <Wheel position={[0, 0.22, 0.66]} r={0.22} w={0.1} rim={p.paper} />
      <Wheel position={[0, 0.22, -0.6]} r={0.22} w={0.1} rim={p.paper} />
      {/* rear body + seat */}
      <Paint color={p.lilac} position={[0, 0.55, -0.38]} scale={[0.22, 0.24, 0.42]}><sphereGeometry args={[1, 32, 20]} /></Paint>
      <RoundedBox args={[0.3, 0.1, 0.6]} radius={0.05} position={[0, 0.8, -0.32]} castShadow>
        <meshStandardMaterial color={DARK} roughness={0.55} />
      </RoundedBox>
      {/* floorboard */}
      <RoundedBox args={[0.34, 0.1, 0.6]} radius={0.04} position={[0, 0.3, 0.12]} castShadow>
        <meshPhysicalMaterial color={p.lilac} clearcoat={1} roughness={0.3} />
      </RoundedBox>
      {/* front apron */}
      <RoundedBox args={[0.4, 0.75, 0.1]} radius={0.05} position={[0, 0.65, 0.5]} rotation={[-0.25, 0, 0]} castShadow>
        <meshPhysicalMaterial color={p.lilac} clearcoat={1} roughness={0.3} />
      </RoundedBox>
      <Paint color={p.lilac} position={[0, 0.28, 0.66]} rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[0.25, 0.05, 8, 24, Math.PI * 0.85]} /></Paint>
      <Tube from={[0, 1.0, 0.5]} to={[0, 0.22, 0.66]} color={CHROME} r={0.025} />
      <RoundedBox args={[0.5, 0.1, 0.16]} radius={0.04} position={[0, 1.05, 0.44]} castShadow>
        <meshPhysicalMaterial color={p.paper} clearcoat={1} roughness={0.3} />
      </RoundedBox>
      <Grip x={0.3} y={1.06} z={0.4} /><Grip x={-0.3} y={1.06} z={0.4} />
      <Glow position={[0, 1.04, 0.53]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.06, 0.06, 0.03, 20]} /></Glow>
      <Glow color="#ff6f8a" intensity={1.5} position={[0, 0.62, -0.8]}><boxGeometry args={[0.14, 0.04, 0.02]} /></Glow>
      {/* mirrors */}
      <Tube from={[0.2, 1.08, 0.44]} to={[0.27, 1.22, 0.42]} color={CHROME} r={0.008} />
      <Tube from={[-0.2, 1.08, 0.44]} to={[-0.27, 1.22, 0.42]} color={CHROME} r={0.008} />
      <mesh position={[0.28, 1.24, 0.42]} scale={[0.05, 0.035, 0.012]}><sphereGeometry args={[1, 12, 8]} /><meshStandardMaterial color={CHROME} metalness={1} roughness={0.1} /></mesh>
      <mesh position={[-0.28, 1.24, 0.42]} scale={[0.05, 0.035, 0.012]}><sphereGeometry args={[1, 12, 8]} /><meshStandardMaterial color={CHROME} metalness={1} roughness={0.1} /></mesh>
      <Rider pose={pose} />
    </group>
  )
}

export function Motorcycle() {
  const p = usePalette()
  const pose: Pose = { size: 1, hip: [0.84, -0.28], hand: [0.34, 1.06, 0.36], feet: { rest: [0.2, 0.42, 0.02] }, lean: 0.38, helmet: p.coral, backpack: true }
  return (
    <group>
      <Wheel position={[0, 0.33, 0.74]} r={0.33} w={0.12} rim="#2f2d40" spokes={0} hub={CHROME} />
      <Wheel position={[0, 0.33, -0.7]} r={0.33} w={0.14} rim="#2f2d40" spokes={0} hub={CHROME} />
      {/* engine */}
      <RoundedBox args={[0.3, 0.32, 0.42]} radius={0.05} position={[0, 0.45, 0.02]} castShadow>
        <meshStandardMaterial color="#5a5870" metalness={0.8} roughness={0.3} />
      </RoundedBox>
      {[-0.1, 0.1].map((x) => (
        <mesh key={x} position={[x * 1.6, 0.62, 0.12]} rotation={[0.4, 0, x > 0 ? -0.6 : 0.6]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.18, 18]} />
          <meshStandardMaterial color={CHROME} metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
      {/* tank */}
      <Paint color={p.coral} position={[0, 0.88, 0.18]} rotation={[-0.15, 0, 0]} scale={[0.19, 0.13, 0.3]}><sphereGeometry args={[1, 32, 20]} /></Paint>
      <Paint color={p.paper} position={[0, 0.9, 0.18]} rotation={[-0.15, 0, 0]} scale={[0.195, 0.04, 0.24]}><sphereGeometry args={[1, 24, 12]} /></Paint>
      {/* frame */}
      <Tube from={[0, 0.98, 0.42]} to={[0, 0.5, 0.25]} color={DARK} r={0.03} />
      <Tube from={[0, 0.8, -0.2]} to={[0, 0.33, -0.7]} color={DARK} r={0.025} />
      <Tube from={[0, 0.45, -0.15]} to={[0, 0.33, -0.7]} color={DARK} r={0.025} />
      {/* seat + tail */}
      <RoundedBox args={[0.3, 0.1, 0.62]} radius={0.05} position={[0, 0.84, -0.32]} rotation={[0.06, 0, 0]} castShadow>
        <meshStandardMaterial color={DARK} roughness={0.6} />
      </RoundedBox>
      <Paint color={p.coral} position={[0, 0.8, -0.66]} scale={[0.14, 0.07, 0.16]}><sphereGeometry args={[1, 20, 12]} /></Paint>
      <Glow color="#ff5d7a" intensity={1.8} position={[0, 0.8, -0.81]}><boxGeometry args={[0.12, 0.04, 0.02]} /></Glow>
      {/* forks */}
      <Tube from={[0.09, 1.04, 0.46]} to={[0.09, 0.33, 0.74]} color={CHROME} r={0.022} />
      <Tube from={[-0.09, 1.04, 0.46]} to={[-0.09, 0.33, 0.74]} color={CHROME} r={0.022} />
      <Paint color={p.coral} position={[0, 0.4, 0.76]} rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[0.35, 0.03, 8, 24, Math.PI * 0.7]} /></Paint>
      {/* bars + headlight */}
      <Tube from={[-0.34, 1.06, 0.36]} to={[0.34, 1.06, 0.36]} color={CHROME} r={0.016} />
      <Grip x={0.34} y={1.06} z={0.36} /><Grip x={-0.34} y={1.06} z={0.36} />
      <mesh position={[0, 0.96, 0.56]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.1, 0.09, 0.1, 24]} /><meshStandardMaterial color={CHROME} metalness={0.9} roughness={0.2} /></mesh>
      <Glow position={[0, 0.96, 0.615]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.085, 0.085, 0.01, 24]} /></Glow>
      {/* exhaust */}
      <Tube from={[0.14, 0.32, 0.1]} to={[0.18, 0.42, -0.72]} color={CHROME} r={0.04} metal={0.95} rough={0.15} />
      {/* side panniers: a traveller's bike */}
      <RoundedBox args={[0.14, 0.26, 0.36]} radius={0.04} position={[0.26, 0.6, -0.48]} castShadow><meshStandardMaterial color={p.mint} roughness={0.7} /></RoundedBox>
      <RoundedBox args={[0.14, 0.26, 0.36]} radius={0.04} position={[-0.26, 0.6, -0.48]} castShadow><meshStandardMaterial color={p.mint} roughness={0.7} /></RoundedBox>
      <Tube from={[0.2, 0.42, 0.02]} to={[-0.2, 0.42, 0.02]} color={CHROME} r={0.015} />
      <Rider pose={pose} />
    </group>
  )
}

export function Car() {
  const p = usePalette()
  const pose: Pose = { size: 1, hip: [0.5, -0.35], hand: [0.17, 0.95, 0.22], feet: { rest: [0.12, 0.25, 0.55] }, lean: -0.1 }
  return (
    <group>
      {[[0.82, 1.25], [-0.82, 1.25], [0.82, -1.2], [-0.82, -1.2]].map(([x, z], i) => (
        <Wheel key={i} position={[x, 0.34, z]} r={0.34} w={0.2} rim={p.paper} hub={CHROME} />
      ))}
      <RoundedBox args={[1.8, 0.56, 3.9]} radius={0.22} smoothness={5} position={[0, 0.62, 0]} castShadow>
        <meshPhysicalMaterial color={p.sky} clearcoat={1} clearcoatRoughness={0.08} roughness={0.25} metalness={0.15} />
      </RoundedBox>
      <RoundedBox args={[1.62, 0.6, 2.1]} radius={0.25} smoothness={5} position={[0, 1.12, -0.25]} castShadow>
        <meshPhysicalMaterial color="#cfe3ff" roughness={0.05} metalness={0.1} transmission={0.6} thickness={0.2} transparent opacity={0.45} />
      </RoundedBox>
      <RoundedBox args={[1.66, 0.08, 2.0]} radius={0.04} position={[0, 1.43, -0.3]} castShadow>
        <meshPhysicalMaterial color={p.paper} clearcoat={1} roughness={0.3} />
      </RoundedBox>
      {/* roof rack + luggage, because the traveller never stops travelling */}
      <RoundedBox args={[0.9, 0.22, 0.7]} radius={0.06} position={[0.1, 1.58, -0.4]} castShadow><meshStandardMaterial color={p.peach} roughness={0.8} /></RoundedBox>
      <RoundedBox args={[0.5, 0.18, 0.5]} radius={0.06} position={[-0.45, 1.56, -0.6]} castShadow><meshStandardMaterial color={p.lemon} roughness={0.8} /></RoundedBox>
      {/* lights */}
      {[0.6, -0.6].map((x) => (
        <group key={x}>
          <Glow position={[x, 0.7, 1.94]} scale={[0.18, 0.08, 0.02]}><sphereGeometry args={[1, 16, 10]} /></Glow>
          <Glow color="#ff5d7a" intensity={1.6} position={[x, 0.72, -1.94]} scale={[0.18, 0.06, 0.02]}><sphereGeometry args={[1, 16, 10]} /></Glow>
        </group>
      ))}
      <RoundedBox args={[1.0, 0.16, 0.06]} radius={0.03} position={[0, 0.5, 1.94]}><meshStandardMaterial color={DARK} /></RoundedBox>
      {/* steering wheel (right-hand drive) + driver */}
      <group position={[-0.4, 0.15, 0]}>
        <mesh position={[0, 0.95, 0.3]} rotation={[-0.5, 0, 0]}><torusGeometry args={[0.17, 0.02, 8, 28]} /><meshStandardMaterial color={DARK} /></mesh>
        <Rider pose={pose} />
      </group>
    </group>
  )
}

export function Vehicle({ id }: { id: VehicleId }) {
  switch (id) {
    case 'stroller': return <Stroller />
    case 'tricycle': return <Tricycle />
    case 'bicycle': return <Bicycle />
    case 'gearcycle': return <Bicycle geared />
    case 'moped': return <Moped />
    case 'scooter': return <Scooter />
    case 'motorcycle': return <Motorcycle />
    case 'car': return <Car />
  }
}
