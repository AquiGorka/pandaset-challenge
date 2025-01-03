import { useEffect, useState } from "react"

import Request from "./FullscreenRequest"
import Exit from "./FullscreenExit"
import "./Fullscreen.css"

const modes = {
  NONE: "none",
  FULLSCREEN: "fullscreen",
  CAN_REQUEST: "can request",
}

function Fullscreen() {
  const [mode, setMode] = useState(modes.NONE)

  const request = () => {
    document.documentElement.requestFullscreen()
    setMode(modes.FULLSCREEN)
  }

  const exit = () => {
    document.exitFullscreen()
    setMode(modes.CAN_REQUEST)
  }

  useEffect(() => {
    if (!document.fullscreenEnabled) {
      return
    }

    const setupMode = () => {
      if (!document.fullscreenElement) {
        setMode(modes.CAN_REQUEST)
        return
      }
      setMode(modes.FULLSCREEN)
    }

    setupMode()
    document.addEventListener("fullscreenchange", setupMode)

    return () => document.removeEventListener("fullscreenchange", setupMode)
  }, [])

  if (mode === modes.NONE) {
    return null
  }

  if (mode === modes.CAN_REQUEST) {
    return (
      <div className="fullscreen-wrap" title="Enter fullscreen mode">
        <button onClick={request}>
          <Request />
        </button>
      </div>
    )
  }

  return (
    <div className="fullscreen-wrap" title="Exit fullscreen mode">
      <button onClick={exit}>
        <Exit />
      </button>
    </div>
  )
}

export default Fullscreen
