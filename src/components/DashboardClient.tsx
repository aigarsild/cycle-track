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
    <div className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold mb-2 sm:mb-0">Service Dashboard</h1>
        <div>
          <label htmlFor="time-range" className="block text-sm font-medium text-gray-700 mb-1">
            Time Range
          </label>
          <select
            id="time-range"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="1">Last 24 Hours</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 3 Months</option>
            <option value="365">Last Year</option>
          </select>
        </div>
      </div>

      {/* User Auth Info */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Welcome, {serverUser.email}</h2>
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Authenticated</span>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          You're logged in using Supabase Authentication. Your account has access to all of the shop management features.
        </p>
        <div className="bg-gray-50 p-3 rounded text-sm">
          <p className="mb-1"><span className="font-medium">User ID:</span> {serverUser.id}</p>
          <p><span className="font-medium">Account Created:</span> {serverUser.created_at ? new Date(serverUser.created_at).toLocaleString() : 'N/A'}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Service Status Cards */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Service Status</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 p-4 rounded">
                <p className="text-sm text-gray-500 mb-1">Waiting in Line</p>
                <p className="text-2xl font-bold">{stats.todoCount}</p>
              </div>
              <div className="bg-gray-100 p-4 rounded">
                <p className="text-sm text-gray-500 mb-1">In Progress</p>
                <p className="text-2xl font-bold">{stats.inProgressCount}</p>
              </div>
              <div className="bg-gray-100 p-4 rounded">
                <p className="text-sm text-gray-500 mb-1">Waiting for Parts</p>
                <p className="text-2xl font-bold">{stats.waitingForPartsCount}</p>
              </div>
              <div className="bg-green-100 p-4 rounded">
                <p className="text-sm text-gray-500 mb-1">Completed</p>
                <p className="text-2xl font-bold">{stats.doneCount}</p>
              </div>
              <div className="bg-gray-100 p-4 rounded">
                <p className="text-sm text-gray-500 mb-1">Archived</p>
                <p className="text-2xl font-bold">{stats.archivedCount}</p>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-md font-medium mb-2">Overview</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ 
                    width: `${Math.min(100, (stats.doneCount / (stats.todoCount + stats.inProgressCount + stats.waitingForPartsCount + stats.doneCount || 1)) * 100)}%` 
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>In Progress: {stats.todoCount + stats.inProgressCount + stats.waitingForPartsCount}</span>
                <span>Completed: {stats.doneCount}</span>
              </div>
            </div>
          </div>

          {/* Financial Insights */}
          <div className="bg-white p-6 rounded-lg shadow h-full">
            <h2 className="text-lg font-semibold mb-4">Financial Insights</h2>
            <div className="mt-4">
              <p className="text-sm font-medium">Total Revenue (Completed Services)</p>
              <p className="text-2xl font-bold text-blue-600 mb-4">
                ${stats.totalRevenue.toFixed(2)}
              </p>
              <div className="border-t my-4"></div>
              <p className="text-sm font-medium">Estimated Revenue (Pending Services)</p>
              <p className="text-2xl font-bold text-purple-600">
                ${stats.estimatedRevenue.toFixed(2)}
              </p>
              <div className="border-t my-4"></div>
              <p className="text-sm font-medium">Potential Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ${(stats.totalRevenue + stats.estimatedRevenue).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 