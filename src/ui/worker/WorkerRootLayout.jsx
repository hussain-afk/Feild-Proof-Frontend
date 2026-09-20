import React from 'react'
import { Outlet } from 'react-router-dom'

function WorkerRootLayout() {
  return (
    <div>
      worker root layout
      <Outlet />
    </div>
  )
}

export default WorkerRootLayout
