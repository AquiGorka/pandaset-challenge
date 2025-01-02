import { useMemo, useEffect, useRef, useState } from "react"
import { Canvas } from "@react-three/fiber"
import {
  Edges,
  PerspectiveCamera,
  shaderMaterial,
  OrbitControls,
} from "@react-three/drei"
import * as THREE from "three"

const URL = "https://static.scale.com/uploads/pandaset-challenge/frame_"

const cuboidMaterial = new THREE.MeshStandardMaterial({
  color: "#98ce9d",
  opacity: 0.05,
  transparent: true,
})

function Cuboids({ data, onHover, onOut }) {
  return data.map((cuboid, index) => {
    const ref = useRef()

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
        ref={ref}
        material={cuboidMaterial}
      >
        <boxGeometry args={[width, height, length]} />
        <Edges linewidth={0.5} threshold={1} color="#98ce9d" opacity={0.01} />
      </mesh>
    )
  })
}

const temp = new THREE.Object3D()

// scaling performance by instancing
// https://r3f.docs.pmnd.rs/advanced/scaling-performance#instancing
function Points({ data, max }) {
  const instancedMeshRef = useRef()
  useEffect(() => {
    for (let i = 0; i < data.length; i++) {
      const [x, y, z] = data[i]
      // translate y <-> z
      temp.position.set(x, z, y)
      temp.updateMatrix()

      // closer to "ground level": whiter, closer to max value: blacker
      const howCloseToMax = 1 - Math.max(z, 0) / max
      const shadeOfGrey = parseInt(255 * howCloseToMax, 10)
        .toString(16)
        .repeat(3)

      instancedMeshRef.current.setColorAt(i, new THREE.Color(`#${shadeOfGrey}`))
      instancedMeshRef.current.setMatrixAt(i, temp.matrix)
    }
    // Update the instance
    instancedMeshRef.current.instanceMatrix.needsUpdate = true
  }, [])

  return (
    <instancedMesh ref={instancedMeshRef} args={[null, null, data.length]}>
      <boxGeometry args={[0.04, 0.04, 0.04]} />
      <meshStandardMaterial color="#FFFFFF" />
    </instancedMesh>
  )
}

export function App() {
  const [page, setPage] = useState(0)
  const [points, setPoints] = useState([])
  const [max, setMax] = useState(0)
  const [cuboids, setCuboids] = useState([])
  const [tooltip, setTooltip] = useState("")

  const handleHover = (str) => {
    setTooltip(str)
    document.body.style.cursor = "pointer"
  }
  const handleOut = () => {
    setTooltip("")
    document.body.style.cursor = "default"
  }

  useEffect(() => {
    const run = async () => {
      const url = `${URL}${page.toString(10).padStart(2, 0)}.json`
      const raw = await fetch(url)
      const res = await raw.json()
      const max = res.points.reduce((p, c) => (c[2] > p ? c[2] : p), 0)

      setPoints(res.points)
      setCuboids(res.cuboids)
      setMax(max)
    }
    run()
  }, [page])

  if (points.length === 0) {
    return <div>Loading</div>
  }

  return (
    <>
      <Canvas frameloop="demand">
        <ambientLight intensity={Math.PI / 2} />
        <PerspectiveCamera makeDefault position={[25, 20, 10]} fov={75} />
        <Points data={points} max={max} />
        <Cuboids data={cuboids} onHover={handleHover} onOut={handleOut} />
        <OrbitControls enablePan={false} />
      </Canvas>
      <div style={{ position: "absolute", top: 15, left: 15 }}>{tooltip}</div>
    </>
  )
}
