import { Header } from '@/components/Header'
import { HeadManagerContext } from 'next/dist/server/future/route-modules/app-page/vendored/contexts/entrypoints'
import React from 'react'

const Dashboard = () => {
  return (
    <>
      <Header />
      <div>Dashboard</div>

    </>

  )
}

export default Dashboard