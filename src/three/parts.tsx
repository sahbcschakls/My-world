import * as THREE from 'three'
import { useMemo, useRef, type ReactNode } from 'react'
import { useFrame, type ThreeElements } from '@react-three/fiber'
import { journey } from '../store'

type V3 = [number, number, number]

const Y = new THREE.Vector3(0, 1, 0)

/** A rounded rod between two points: frames, forks, handlebars, limbs. */
export function Tube({ from, to, r = 0.025, color, metal = 0.6, rough = 0.35 }: {
  from: V3; to: V3; r?: number; color: string; metal?: number; rough?: number
}) {
  const { pos, quat, len } = useMemo(() => {
    const a = new THREE.Vector3(...from)
    const b = new THREE.Vector3(...to)
    const dir = b.clone().sub(a)
    const len = dir.length()
    const quat = new THREE.Quaternion().setFromUnitVectors(Y, dir.normalize())
    return { pos: a.add(b).multiplyScalar(0.5), quat, len }
  }, [from[0], from[1], from[2], to[0], to[1], to[2]])
  return (
    <mesh position={pos} quaternion={quat} castShadow>
      <capsuleGeometry args={[r, len, 4, 10]} />
      <meshStandardMaterial color={color} metalness={metal} roughness={rough} />
    </mesh>
  )
}

/**
 * A wheel that spins with the distance travelled. The axle runs along X,
 * so the wheel rolls forward along +Z.
 */
export function Wheel({ position, r, w = 0.05, rim, spokes = 0, tyre = '#2b2b33', hub }: {
  position: V3; r: number; w?: number; rim: string; spokes?: number; tyre?: string; hub?: string
}) {
  const spin = useRef<THREE.Group>(null)
  useFrame(() => {
    if (spin.current) spin.current.rotation.x = journey.distance / r
  })
  const tube = Math.max(w * 0.6, r * 0.12)
  return (
    <group position={position}>
      <group ref={spin}>
        <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
          <torusGeometry args={[r - tube, tube, 14, 40]} />
          <meshStandardMaterial color={tyre} roughness={0.85} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[r - tube * 1.6, r - tube * 1.6, w * 0.7, 32, 1, true]} />
          <meshStandardMaterial color={rim} metalness={0.7} roughness={0.25} side={THREE.DoubleSide} />
        </mesh>
        {spokes > 0
          ? Array.from({ length: spokes }, (_, i) => (
              <mesh key={i} rotation={[(i / spokes) * Math.PI, 0, 0]}>
                <boxGeometry args={[0.006, (r - tube) * 2, 0.006]} />
                <meshStandardMaterial color="#d9dbe4" metalness={0.9} roughness={0.2} />
              </mesh>
            ))
          : (
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[(r - tube) * 0.85, (r - tube) * 0.85, w * 0.5, 24]} />
                <meshStandardMaterial color={rim} metalness={0.5} roughness={0.3} />
              </mesh>
            )}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[r * 0.14, r * 0.14, w * 1.2, 16]} />
          <meshStandardMaterial color={hub ?? '#cfd3df'} metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
    </group>
  )
}

/** Soft, glossy painted body panel: the pastel "toy" paint used on vehicles. */
export function Paint({ color, children, ...props }: { color: string; children: ReactNode } & ThreeElements['mesh']) {
  return (
    <mesh castShadow {...props}>
      {children}
      <meshPhysicalMaterial color={color} roughness={0.32} metalness={0.05} clearcoat={1} clearcoatRoughness={0.15} />
    </mesh>
  )
}

/** Self-lit light (headlights, lamps). Brightens at night. */
export function Glow({ color = '#fff4c2', intensity = 2, children, ...props }: {
  color?: string; intensity?: number; children: ReactNode
} & ThreeElements['mesh']) {
  return (
    <mesh {...props}>
      {children}
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} toneMapped={false} />
    </mesh>
  )
}
