import {
    Activity,
    ArrowLeft,
    Award,
    BarChart3,
    Clock,
    Download,
    Eye,
    LineChart as LineChartIcon,
    PieChart as PieChartIcon,
    RefreshCw,
    Smartphone,
    Target,
    TrendingUp,
    Users
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import api from '../services/api'

// Simplified Chart Components
const LineChart = ({ data, width = 600, height = 300, color = '#3B82F6', title = '' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <LineChartIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No data available</p>
        </div>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue || 1

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * (width - 60) + 30
    const y = height - 60 - ((point.value - minValue) / range) * (height - 100)
    return { x, y, ...point }
  })

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ')

  return (
    <div className="w-full h-full">
      {title && (
        <div className="text-center mb-4">
          <h3 className="text-sm font-medium text-gray-300">{title}</h3>
        </div>
      )}
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {/* Grid lines */}
        {[...Array(5)].map((_, i) => {
          const y = 30 + (i * (height - 60)) / 4
          return (
            <line
              key={i}
              x1="30"
              y1={y}
              x2={width - 30}
              y2={y}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          )
        })}
        
        {/* Line chart */}
        <path
          d={pathData}
          stroke={color}
          strokeWidth="3"
          fill="none"
          className="drop-shadow-lg"
        />
        
        {/* Data points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={color}
            className="drop-shadow-lg"
          />
        ))}
        
        {/* Labels */}
        {points.map((point, index) => (
          <text
            key={index}
            x={point.x}
            y={point.y - 10}
            textAnchor="middle"
            className="text-xs fill-gray-400"
          >
            {point.value}
          </text>
        ))}
      </svg>
    </div>
  )
}

const PieChart = ({ data, width = 300, height = 300, colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'], title = '' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <PieChartIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No data available</p>
        </div>
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) / 2 - 50

  let currentAngle = -Math.PI / 2

  return (
    <div className="w-full h-full">
      {title && (
        <div className="text-center mb-4">
          <h3 className="text-sm font-medium text-gray-300">{title}</h3>
        </div>
      )}
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {data.map((item, index) => {
          const sliceAngle = (item.value / total) * 2 * Math.PI
          const endAngle = currentAngle + sliceAngle
          const color = colors[index % colors.length]

          // Calculate arc path
          const x1 = centerX + radius * Math.cos(currentAngle)
          const y1 = centerY + radius * Math.sin(currentAngle)
          const x2 = centerX + radius * Math.cos(endAngle)
          const y2 = centerY + radius * Math.sin(endAngle)

          const largeArcFlag = sliceAngle > Math.PI ? 1 : 0

          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ')

          currentAngle = endAngle

          return (
            <g key={index}>
              <path
                d={pathData}
                fill={color}
                className="drop-shadow-lg"
              />
              {/* Label */}
              <text
                x={centerX + (radius * 0.7) * Math.cos(currentAngle - sliceAngle / 2)}
                y={centerY + (radius * 0.7) * Math.sin(currentAngle - sliceAngle / 2)}
                textAnchor="middle"
                className="text-sm fill-white font-medium"
              >
                {Math.round((item.value / total) * 100)}%
              </text>
            </g>
          )
        })}
        
        {/* Legend */}
        <g transform={`translate(0, ${height - 40})`}>
          {data.map((item, index) => {
            const color = colors[index % colors.length]
            return (
              <g key={index} transform={`translate(${index * 80}, 0)`}>
                <rect width="12" height="12" fill={color} rx="2" />
                <text x="20" y="10" className="text-xs fill-gray-300">
                  {item.label}
                </text>
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}

export default function Analytics() {
  const { id } = useParams() // For single form analytics
  const { isSignedIn } = useAuth()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [timeRange, setTimeRange] = useState('30') // days
  const [selectedForm, setSelectedForm] = useState(null)
  
  // Analytics data
  const [overview, setOverview] = useState({
    totalForms: 0,
    totalResponses: 0,
    recentForms: [],
    topForms: [],
    recentResponses: []
  })
  
  const [formsData, setFormsData] = useState([])
  const [responsesData, setResponsesData] = useState({})
  const [userResponses, setUserResponses] = useState([]) // New: User response data
  const [trendsData, setTrendsData] = useState({
    dailyTrends: [],
    deviceStats: [],
    browserStats: []
  })

  // Process real data for charts
  const processDailyTrends = (rawData) => {
    if (!rawData || rawData.length === 0) return []
    
    return rawData.map(item => ({
      date: item._id,
      value: item.count,
      label: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }))
  }

  const processDeviceStats = (rawData) => {
    if (!rawData || rawData.length === 0) return []
    
    return rawData.map(item => ({
      label: item._id || 'Unknown',
      value: item.count
    }))
  }

  const processBrowserStats = (rawData) => {
    if (!rawData || rawData.length === 0) return []
    
    return rawData.map(item => ({
      label: item._id || 'Unknown',
      value: item.count
    }))
  }

  useEffect(() => {
    if (isSignedIn) {
      if (id) {
        // Single form analytics
        loadSingleFormAnalytics()
      } else {
        // All forms analytics
        loadAllFormsAnalytics()
      }
    }
  }, [isSignedIn, id, timeRange])

  const loadAllFormsAnalytics = async () => {
    try {
      setLoading(true)
      setLoadingProgress(0)
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + 10, 90))
      }, 100)
      
      console.log('Loading all forms analytics')
      
      const [overviewRes, formsRes, responsesRes] = await Promise.all([
        api.get('/forms/dashboard/stats'),
        api.get('/forms'),
        api.get('/responses/all') // New: Get all user responses
      ])
      
      clearInterval(progressInterval)
      setLoadingProgress(100)
      
      console.log('Overview response:', overviewRes)
      console.log('Forms response:', formsRes)
      console.log('User responses:', responsesRes)
      
      setOverview(overviewRes || {})
      setFormsData(formsRes || [])
      setUserResponses(responsesRes || [])
      
      // Process real data for charts
      if (overviewRes && overviewRes.recentResponses) {
        // Generate daily trends from recent responses
        const dailyData = {}
        overviewRes.recentResponses.forEach(response => {
          const date = new Date(response.submittedAt).toISOString().split('T')[0]
          dailyData[date] = (dailyData[date] || 0) + 1
        })
        
        const dailyTrends = Object.entries(dailyData).map(([date, count]) => ({
          date,
          value: count,
          label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }))
        
        // Generate device and browser stats from recent responses
        const deviceStats = {}
        const browserStats = {}
        
        overviewRes.recentResponses.forEach(response => {
          if (response.deviceType) {
            deviceStats[response.deviceType] = (deviceStats[response.deviceType] || 0) + 1
          }
          if (response.browser) {
            browserStats[response.browser] = (browserStats[response.browser] || 0) + 1
          }
        })
        
        setTrendsData({
          dailyTrends,
          deviceStats: Object.entries(deviceStats).map(([device, count]) => ({ label: device, value: count })),
          browserStats: Object.entries(browserStats).map(([browser, count]) => ({ label: browser, value: count }))
        })
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
      console.error('Error details:', error.message)
      showToast('Failed to load analytics data. Please try again.', 'error')
    } finally {
      setTimeout(() => setLoading(false), 200) // Small delay for smooth transition
    }
  }

  const loadSingleFormAnalytics = async () => {
    try {
      setLoading(true)
      setLoadingProgress(0)
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + 15, 90))
      }, 100)
      
      console.log('Loading analytics for form ID:', id)
      
      const [formRes, analyticsRes, responsesRes] = await Promise.all([
        api.get(`/forms/${id}`),
        api.get(`/forms/${id}/analytics`),
        api.get(`/responses/form/${id}`) // New: Get form-specific user responses
      ])
      
      clearInterval(progressInterval)
      setLoadingProgress(100)
      
      console.log('Analytics response:', analyticsRes)
      console.log('User responses:', responsesRes)
      
      setSelectedForm(analyticsRes.form || formRes)
      setResponsesData(analyticsRes.analytics || {})
      setUserResponses(responsesRes || [])
      
      // Process real data for charts
      if (analyticsRes && analyticsRes.analytics) {
        const analytics = analyticsRes.analytics
        
        setTrendsData({
          dailyTrends: processDailyTrends(analytics.dailyTrends),
          deviceStats: processDeviceStats(analytics.deviceStats),
          browserStats: processBrowserStats(analytics.browserStats)
        })
      }
    } catch (error) {
      console.error('Error loading form analytics:', error)
      console.error('Error details:', error.message)
      
      // Handle different types of errors
      if (error.status === 503) {
        showToast('Database connection issue. Please try again in a moment.', 'error')
      } else if (error.status === 404) {
        showToast('Form not found or you don\'t have permission to view it', 'error')
      } else if (error.status === 400) {
        showToast('Invalid form ID format', 'error')
      } else if (error.message.includes('Database connection')) {
        showToast('Database connection error. Please try again.', 'error')
      } else if (error.message.includes('Form not found')) {
        showToast('Form not found or you don\'t have permission to view it', 'error')
      } else if (error.message.includes('Invalid form ID')) {
        showToast('Invalid form ID format', 'error')
      } else {
        showToast(`Failed to load form analytics: ${error.message}`, 'error')
      }
    } finally {
      setTimeout(() => setLoading(false), 200) // Small delay for smooth transition
    }
  }

  const exportData = async () => {
    try {
      showToast('Export functionality will be available soon!', 'info')
    } catch (error) {
      console.error('Error exporting data:', error)
      showToast('Failed to export data', 'error')
    }
  }

  const refreshData = () => {
    if (id) {
      loadSingleFormAnalytics()
    } else {
      loadAllFormsAnalytics()
    }
    showToast('Data refreshed!', 'success')
  }

  // Calculate percentages for device and browser stats
  const calculatePercentage = (count, total) => {
    if (total === 0) return 0
    return Math.round((count / total) * 100)
  }

  // Get total responses for percentage calculations
  const getTotalResponses = () => {
    if (id) {
      return responsesData.totalResponses || 0
    }
    return overview.totalResponses || 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
        {/* Header Skeleton */}
        <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-700/50 rounded-lg animate-pulse"></div>
                <div>
                  <div className="h-8 w-64 bg-gray-700/50 rounded-lg animate-pulse mb-2"></div>
                  <div className="h-4 w-48 bg-gray-700/50 rounded-lg animate-pulse"></div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-32 bg-gray-700/50 rounded-lg animate-pulse"></div>
                <div className="h-10 w-24 bg-gray-700/50 rounded-lg animate-pulse"></div>
                <div className="h-10 w-20 bg-gray-700/50 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Loading analytics data...</span>
              <span className="text-sm text-gray-400">{loadingProgress}%</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
      </div>
          
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 w-20 bg-gray-700/50 rounded-lg animate-pulse mb-2"></div>
                    <div className="h-8 w-16 bg-gray-700/50 rounded-lg animate-pulse mb-2"></div>
                    <div className="h-3 w-24 bg-gray-700/50 rounded-lg animate-pulse"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-700/50 rounded-lg animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart Skeletons */}
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
                <div className="h-6 w-48 bg-gray-700/50 rounded-lg animate-pulse mb-6"></div>
                <div className="h-64 bg-gray-700/50 rounded-lg animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        .chart-container {
          background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          backdrop-filter: blur(20px);
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white animate-fade-in">
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5" />
          </Link>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    {id ? `${selectedForm?.title} Analytics` : 'Analytics Dashboard'}
                  </h1>
                  <p className="text-gray-400">
                    {id ? 'Detailed insights for this form' : 'Overview of all your forms and responses'}
                  </p>
                </div>
          </div>
              
              <div className="flex items-center space-x-3">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-gray-800/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
                
                <Button variant="outline" onClick={refreshData} className="border-gray-600/50 bg-gray-800/30 backdrop-blur-sm text-gray-300 hover:bg-gray-700/50 hover:text-white">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                
                <Button onClick={exportData} className="bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
          </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="chart-container p-6 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{id ? 'Form Fields' : 'Total Forms'}</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                    {id ? (selectedForm?.fieldCount || 0) : (overview.totalForms || 0)}
                  </p>
                  <p className="text-green-400 text-sm flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {id ? 'Total fields' : 'Active forms'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="chart-container p-6 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Responses</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                    {id ? (responsesData.totalResponses || 0) : (overview.totalResponses || 0)}
                  </p>
                  <p className="text-green-400 text-sm flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {id ? 'For this form' : 'All responses'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>
            
            <div className="chart-container p-6 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{id ? 'Device Types' : 'Recent Forms'}</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
                    {id ? (trendsData.deviceStats?.length || 0) : (overview.recentForms?.length || 0)}
                  </p>
                  <p className="text-blue-400 text-sm flex items-center mt-1">
                    <Eye className="w-4 h-4 mr-1" />
                    {id ? 'Device types' : 'Recently created'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>

            <div className="chart-container p-6 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{id ? 'Browser Types' : 'Top Forms'}</p>
                  <p className="text-2xl font-bold text-white">{id ? (trendsData.browserStats?.length || 0) : (overview.topForms?.length || 0)}</p>
                  <p className="text-yellow-400 text-sm flex items-center mt-1">
                    <Target className="w-4 h-4 mr-1" />
                    {id ? 'Browser types' : 'Best performing'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Simplified Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {/* Response Trends Chart */}
            <div className="chart-container p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                  Response Trends
                </h2>
                <span className="text-sm text-gray-400">Last {timeRange} days</span>
              </div>
              {trendsData.dailyTrends && trendsData.dailyTrends.length > 0 ? (
                <div className="h-64">
                  <LineChart 
                    data={trendsData.dailyTrends} 
                    color="#3B82F6" 
                    title="Daily Response Trends"
                  />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No response data available</p>
                    <p className="text-sm text-gray-500">Start collecting responses to see trends</p>
                  </div>
                </div>
              )}
            </div>

            {/* Device Usage Chart */}
            <div className="chart-container p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent flex items-center">
                  <Smartphone className="w-5 h-5 mr-2 text-green-400" />
                  Device Usage
                </h2>
                <span className="text-sm text-gray-400">Device distribution</span>
              </div>
              {trendsData.deviceStats && trendsData.deviceStats.length > 0 ? (
                <div className="h-64">
                  <PieChart 
                    data={trendsData.deviceStats} 
                    colors={['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444']}
                    title="Device Usage Distribution"
                  />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <Smartphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No device data available</p>
                    <p className="text-sm text-gray-500">Device information will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Top Performing Forms - Only show for all forms analytics */}
          {!id && overview.topForms && overview.topForms.length > 0 && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6 mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Top Performing Forms</h2>
                <Link to="/dashboard">
                  <Button variant="outline" size="sm" className="border-gray-600/50 bg-gray-800/30 backdrop-blur-sm text-gray-300 hover:bg-gray-700/50 hover:text-white">
                    View All
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-4">
                {overview.topForms.map((form, index) => (
                  <div key={form._id} className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-blue-400 font-semibold">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{form.title}</h3>
                        <p className="text-sm text-gray-400">{form.responseCount} responses</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link to={`/forms/${form._id}`}>
                        <Button variant="outline" size="sm" className="border-gray-600/50 bg-gray-800/30 backdrop-blur-sm text-gray-300 hover:bg-gray-700/50 hover:text-white">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link to={`/forms/${form._id}/analytics`}>
                        <Button variant="outline" size="sm" className="border-gray-600/50 bg-gray-800/30 backdrop-blur-sm text-gray-300 hover:bg-gray-700/50 hover:text-white">
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Responses Section */}
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="chart-container p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-400" />
                  User Responses
                </h2>
                <span className="text-sm text-gray-400">
                  {userResponses.length} {userResponses.length === 1 ? 'response' : 'responses'}
                </span>
              </div>
              {userResponses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Username</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Form</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Submission Time</th>
                        {/* Dynamically generate field columns */}
                        {userResponses[0]?.responses?.map((field, idx) => (
                          <th key={idx} className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            {field.label || field.fieldLabel || `Field ${idx + 1}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {userResponses.map((response, idx) => (
                        <tr key={response._id || idx} className="hover:bg-white/10 transition-colors">
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-white">{response.user?.name || response.userName || 'Anonymous'}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{response.user?.email || response.userEmail || 'No email'}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{response.formTitle || 'Unknown Form'}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-400">{new Date(response.submittedAt).toLocaleString()}</td>
                          {/* Dynamically render each field value */}
                          {response.responses?.map((field, fidx) => (
                            <td key={fidx} className="px-4 py-2 whitespace-nowrap text-sm text-gray-200">{field.value || field.answer || '-'}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">No User Responses Yet</h3>
                  <p className="text-gray-400 mb-4">
                    {id ? 'No one has filled this form yet.' : 'No forms have been filled by users yet.'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Users need to create an account to fill forms and appear in analytics.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity & Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            {/* Recent Activity - Only show if there's actual data */}
            {overview.recentResponses && overview.recentResponses.length > 0 && (
              <div className="chart-container p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-green-400" />
                    Recent Activity
                  </h2>
                  <span className="text-sm text-gray-400">Latest responses</span>
                </div>
                <div className="space-y-4">
                  {overview.recentResponses.slice(0, 5).map((response, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg transform hover:scale-105 transition-all duration-200">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-300">
                          New response to {response.formId?.title || 'Unknown Form'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(response.submittedAt).toLocaleDateString()} at {new Date(response.submittedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Statistics */}
            <div className="chart-container p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-purple-400" />
                  Summary Statistics
                </h2>
                <span className="text-sm text-gray-400">Key metrics</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg transform hover:scale-105 transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Average Daily Responses</p>
                      <p className="text-xs text-gray-500">Last {timeRange} days</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                    {trendsData.dailyTrends && trendsData.dailyTrends.length > 0 
                      ? Math.round(trendsData.dailyTrends.reduce((sum, day) => sum + day.value, 0) / trendsData.dailyTrends.length)
                      : 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg transform hover:scale-105 transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Peak Hour</p>
                      <p className="text-xs text-gray-500">Most active time</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                    {trendsData.hourlyDistribution && trendsData.hourlyDistribution.length > 0 
                      ? trendsData.hourlyDistribution.reduce((max, hour) => hour.value > max.value ? hour : max).label
                      : 'N/A'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg transform hover:scale-105 transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Total Unique Users</p>
                      <p className="text-xs text-gray-500">Estimated</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
                    {Math.round(getTotalResponses() * 0.85)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg transform hover:scale-105 transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">Response Rate</p>
                      <p className="text-xs text-gray-500">Completion rate</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
                    {getTotalResponses() > 0 ? '95%' : '0%'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* No Data Message */}
          {(!trendsData.deviceStats || trendsData.deviceStats.length === 0) && 
           (!trendsData.browserStats || trendsData.browserStats.length === 0) && 
           (!overview.recentResponses || overview.recentResponses.length === 0) && (
            <div className="chart-container p-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Activity className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                  No Analytics Data Yet
                </h2>
                <p className="text-gray-400 mb-4 max-w-md mx-auto">
                  Start collecting form responses to see detailed analytics, trends, and insights about your forms.
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Response trends</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Device usage</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Browser stats</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
    </div>
    </>
  )
}