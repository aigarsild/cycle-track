'use client'

import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import type { DashboardStats } from '@/types'

interface DashboardClientProps {
  serverUser: User
}

export default function DashboardClient({ serverUser }: DashboardClientProps) {
  const [timeRange, setTimeRange] = useState('30') // Default to 30 days
  const [stats, setStats] = useState<DashboardStats>({
    todoCount: 0,
    inProgressCount: 0,
    waitingForPartsCount: 0,
    doneCount: 0,
    archivedCount: 0,
    totalRevenue: 0,
    estimatedRevenue: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData(timeRange)
  }, [timeRange])

  const fetchDashboardData = async (daysRange: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/dashboard?timeRange=${daysRange}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch dashboard data')
      }
      
      const data = await response.json()
      setStats(data.stats)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="mb-6">
        <div className="bg-white shadow rounded-lg p-4 mb-4">
          <h2 className="text-xl font-semibold mb-2">Welcome, {serverUser.email}</h2>
          <p className="text-gray-600">
            {serverUser.user_metadata?.role === 'admin' ? 'Administrator Account' : 'User Account'}
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Time Range</h2>
            <div className="flex space-x-2">
              {['Last 24 Hours', 'Last 7 Days', 'Last 30 Days', 'Last 3 Months', 'Last Year'].map((range) => (
                <button
                  key={range}
                  className={`px-3 py-1 rounded text-sm ${
                    timeRange === range 
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading dashboard data...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Service Status Cards */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Service Status</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Waiting in Line</span>
                  <span className="font-bold text-yellow-500">{stats?.todoCount || 0}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">In Progress</span>
                  <span className="font-bold text-blue-500">{stats?.inProgressCount || 0}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Waiting for Parts</span>
                  <span className="font-bold text-purple-500">{stats?.waitingForPartsCount || 0}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-bold text-green-500">{stats?.doneCount || 0}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Archived</span>
                  <span className="font-bold text-gray-500">{stats?.archivedCount || 0}</span>
                </div>
              </div>
            </div>
            
            {/* Financial Insights */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Financial Insights</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Revenue</span>
                  <span className="font-bold text-green-600">€{stats?.totalRevenue?.toFixed(2) || '0.00'}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Estimated Pipeline</span>
                  <span className="font-bold text-blue-600">€{stats?.estimatedRevenue?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
            
            {/* Account Settings */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Settings</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Account Settings</span>
                  <a 
                    href="/account" 
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    Configure
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </a>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Receipt Settings</span>
                  <a 
                    href="/account#receipt" 
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    Configure
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </a>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Receipt Preview</span>
                  <a 
                    href="/receipt-preview" 
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    View
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
} 