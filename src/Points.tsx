import { useEffect, useRef } from "react"
import * as THREE from "three"

const temp = new THREE.Object3D()

interface PointsProps {
  max: number
  data: [number, number, number][]
}

// scaling performance by instancing
// https://r3f.docs.pmnd.rs/advanced/scaling-performance#instancing
function Points({ data, max }: PointsProps) {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null)

  useEffect(() => {
    for (let i = 0; i < data.length; i++) {
      const [x, y, z] = data[i]
      // translate y <-> z
      temp.position.set(x, z, y)
      temp.updateMatrix()

      // closer to "ground level": whiter, closer to max value: blacker
      const howCloseToMax: number = 1 - Math.max(z, 0) / max
      const shadeOfGreyInt: number = Math.floor(255 * howCloseToMax)
      const shadeOfGreyStr: string = shadeOfGreyInt.toString(16)
      const shadeOfGrey: string = `${shadeOfGreyStr}${shadeOfGreyStr}${shadeOfGreyStr}`

      if (!instancedMeshRef.current) {
        return
      }
      instancedMeshRef.current.setColorAt(i, new THREE.Color(`#${shadeOfGrey}`))
      instancedMeshRef.current.setMatrixAt(i, temp.matrix)
    }
    // Update the instance
    if (!instancedMeshRef.current) {
      return
    }
    instancedMeshRef.current.instanceMatrix.needsUpdate = true
  }, [])

  return (
    <instancedMesh ref={instancedMeshRef} args={[null, null, data.length]}>
      <boxGeometry args={[0.04, 0.04, 0.04]} />
      <meshStandardMaterial color="#FFFFFF" />
    </instancedMesh>
  )
}

export default Points
