import React from 'react'
import DashboardSidebar from './Components/DashboardSidebar'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className='flex min-h-screen bg-[var(--aippt-bg)] text-[var(--aippt-text)]'>
            <DashboardSidebar />
            <div className='w-full min-w-0'>
                {children}
            </div>
        </div>
    )
}

export default layout
