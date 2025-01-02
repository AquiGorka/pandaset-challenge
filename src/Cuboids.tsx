import * as THREE from "three"
import { Edges } from "@react-three/drei"

const cuboidMaterial = new THREE.MeshStandardMaterial({
  color: "#98ce9d",
  opacity: 0.05,
  transparent: true,
})

interface CuboidData {
  "position.x": number
  "position.y": number
  "position.z": number
  "dimensions.x": number
  "dimensions.y": number
  "dimensions.z": number
  yaw: number
  label: string
  stationary: boolean
}

interface CuboidsProps {
  data: CuboidData[]
  onHover: (str: string) => void
  onOut: () => void
}

function Cuboids({ data, onHover, onOut }: CuboidsProps) {
  return data.map((cuboid, index) => {
    const {
      "position.x": x,
      "position.y": y,
      "position.z": z,
      "dimensions.x": width,
      "dimensions.y": length,
      "dimensions.z": height,
      yaw,
      label,
      stationary,
    } = cuboid

    return (
      <mesh
        onPointerOver={() => {
          onHover(
            `${label}${stationary ? " (stationary)" : " (not stationary)"}`,
          )
        }}
        onPointerLeave={onOut}
        /* translate y <-> z */
        position={[x, z, y]}
        rotation={[0, -yaw, 0]}
        key={`${x}-${y}-${z}-${index}-cuboid`}
        material={cuboidMaterial}
      >
        <boxGeometry args={[width, height, length]} />
        <Edges linewidth={0.5} threshold={1} color="#98ce9d" opacity={0.01} />
      </mesh>
    )
  })
}

export default Cuboids
