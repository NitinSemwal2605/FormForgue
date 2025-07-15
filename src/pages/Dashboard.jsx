import {
    Archive,
    BarChart3,
    Calendar,
    Copy,
    Download,
    Edit,
    Eye,
    FileText,
    Grid,
    List,
    MoreHorizontal,
    Plus,
    Search,
    Share2,
    Trash2,
    TrendingUp,
    Users
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    FacebookIcon,
    FacebookShareButton,
    LinkedinIcon,
    LinkedinShareButton,
    TwitterIcon,
    TwitterShareButton,
    WhatsappIcon,
    WhatsappShareButton
} from 'react-share'
import { Badge } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/DropdownMenu'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

export default function Dashboard() {
  const [forms, setForms] = useState([])
  const [filteredForms, setFilteredForms] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'table'
  const { user, isSignedIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchForms() {
      setLoading(true)
      try {
        const res = await api.get('/forms')
        setForms(res || [])
        setFilteredForms(res || [])
      } catch (err) {
        setForms([])
        setFilteredForms([])
      }
      setLoading(false)
    }
    fetchForms()
  }, [])

  useEffect(() => {
    let filtered = forms

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(form =>
        (form.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (form.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(form => form.status === statusFilter)
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(form => form.category === categoryFilter)
    }

    setFilteredForms(filtered)
  }, [forms, searchTerm, statusFilter, categoryFilter])

  const deleteForm = async (formId) => {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) return
    await api.delete(`/forms/${formId}`)
    setForms(forms.filter(form => form._id !== formId))
  }

  const copyShareUrl = (formId) => {
    const url = `${window.location.origin}/form/${formId}`
    navigator.clipboard.writeText(url)
      .then(() => {
        alert('Share URL copied to clipboard!')
      })
      .catch((err) => {
        alert('Failed to copy link!')
        console.error(err)
      })
  }

  const duplicateForm = (form) => {
    // Optionally implement duplication via backend
  }

  const handleNativeShare = (form) => {
    const url = `${window.location.origin}/form/${form._id}`
    if (navigator.share) {
      navigator.share({
        title: form.title,
        text: form.description,
        url,
      })
    } else {
      alert('Native sharing is not supported on this device.')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success'
      case 'draft': return 'warning'
      case 'archived': return 'secondary'
      default: return 'default'
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'feedback': return <Users className="w-4 h-4" />
      case 'events': return <Calendar className="w-4 h-4" />
      case 'internal': return <FileText className="w-4 h-4" />
      case 'marketing': return <TrendingUp className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const totalResponses = forms.reduce((sum, form) => sum + (form.responseCount || 0), 0)
  const activeForms = forms.filter(form => form.status === 'active').length
  const draftForms = forms.filter(form => form.status === 'draft').length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Manage your forms and track their performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10 text-white shadow-2xl hover:bg-white/10 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-2xl">{forms.length}</CardTitle>
              <CardDescription className="text-gray-300">Total Forms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-8 h-8 bg-blue-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10 text-white shadow-2xl hover:bg-white/10 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-2xl">{totalResponses}</CardTitle>
              <CardDescription className="text-gray-300">Total Responses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-8 h-8 bg-green-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10 text-white shadow-2xl hover:bg-white/10 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-2xl">{activeForms}</CardTitle>
              <CardDescription className="text-gray-300">Active Forms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-8 h-8 bg-purple-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10 text-white shadow-2xl hover:bg-white/10 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-2xl">{draftForms}</CardTitle>
              <CardDescription className="text-gray-300">Draft Forms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-8 h-8 bg-orange-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Edit className="w-5 h-5 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search forms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-400 shadow-sm"
            />
            </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800/50 backdrop-blur-sm text-white shadow-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800/50 backdrop-blur-sm text-white shadow-sm"
            >
              <option value="all">All Categories</option>
              <option value="feedback">Feedback</option>
              <option value="events">Events</option>
              <option value="internal">Internal</option>
              <option value="marketing">Marketing</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-700 rounded-xl overflow-hidden bg-gray-800/50 backdrop-blur-sm shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-3 transition-colors ${viewMode === 'grid' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-3 transition-colors ${viewMode === 'table' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <Link to="/forms/new">
              <Button className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold shadow-lg border border-white/20">
                <Plus className="w-4 h-4 mr-2" />
                Create Form
              </Button>
              </Link>
          </div>
        </div>

        {/* Forms Display */}
        {filteredForms.length === 0 ? (
          <Card className="text-center py-12 bg-white/5 backdrop-blur-xl border-white/10">
            <CardContent>
              <div className="w-24 h-24 bg-gray-800/50 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-12 h-12 text-gray-500" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2">
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' ? 'No forms found' : 'No forms yet'}
              </h3>
              <p className="text-gray-400 mb-6">
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Create your first form to get started'}
              </p>
              {!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && (
              <Link to="/forms/new">
                  <Button className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white shadow-lg border border-white/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Form
                  </Button>
              </Link>
              )}
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form, idx) => (
              <Card 
                  key={form._id}
                className="group transition-all duration-300 hover:scale-[1.03] border-0 shadow-xl bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 rounded-2xl p-2 ring-1 ring-inset ring-blue-900/10 hover:ring-blue-500/20"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 mb-2">
                      {getCategoryIcon(form.category)}
                      <Badge variant={getStatusColor(form.status)} className="text-xs">
                        {form.status}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-white mb-2 line-clamp-2">
                      {form.title}
                  </CardTitle>
                  <CardDescription className="text-gray-400 line-clamp-2">
                    {form.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pb-4">
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                      {form.responseCount} responses
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(form.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-0">
                  <div className="flex flex-col gap-2 w-full">
                    <div className="grid grid-cols-5 gap-2 w-full mt-2">
                      <Link to={`/forms/${form._id}`} className="flex">
                        <Button variant="outline" size="icon" className="h-8 w-8 p-0 border-gray-600/50 bg-gray-800/30 backdrop-blur-sm text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg shadow-sm flex items-center justify-center">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link to={`/forms/${form._id}/edit`} className="flex">
                        <Button variant="outline" size="icon" className="h-8 w-8 p-0 border-gray-600/50 bg-gray-800/30 backdrop-blur-sm text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg shadow-sm flex items-center justify-center">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link to={`/forms/${form._id}/analytics`} className="flex">
                        <Button variant="outline" size="icon" className="h-8 w-8 p-0 border-gray-600/50 bg-gray-800/30 backdrop-blur-sm text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg shadow-sm flex items-center justify-center">
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => copyShareUrl(form._id)}
                        className="h-8 w-8 p-0 border-gray-600/50 bg-gray-800/30 backdrop-blur-sm text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg shadow-sm flex items-center justify-center"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => deleteForm(form._id)}
                        className="h-8 w-8 p-0 border-gray-600/50 bg-gray-800/30 backdrop-blur-sm text-gray-300 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 rounded-lg shadow-sm flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
              ))}
            </div>
        ) : (
          // Table View
          <Card className="shadow-lg border-0 bg-white/5 backdrop-blur-xl border-white/10">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800/50">
                  <TableHead className="text-gray-300">Form</TableHead>
                  <TableHead className="text-gray-300">Category</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Responses</TableHead>
                  <TableHead className="text-gray-300">Last Updated</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredForms.map((form) => (
                  <TableRow key={form._id} className="hover:bg-gray-800/30 border-gray-800/50">
                    <TableCell>
                      <div>
                        <div className="font-semibold text-white">{form.title}</div>
                        <div className="text-sm text-gray-400 line-clamp-1">{form.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(form.category)}
                        <span className="capitalize text-gray-300">{form.category}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(form.status)}>
                        {form.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-white">{form.responseCount}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-400">
                        {new Date(form.updatedAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link to={`/forms/${form._id}`}>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-gray-600/50 bg-gray-800/30 backdrop-blur-sm text-gray-300 hover:bg-gray-700/50 hover:text-white">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link to={`/forms/${form._id}/edit`}>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-gray-600/50 bg-gray-800/30 backdrop-blur-sm text-gray-300 hover:bg-gray-700/50 hover:text-white">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link to={`/forms/${form._id}/analytics`}>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-gray-600/50 bg-gray-800/30 backdrop-blur-sm text-gray-300 hover:bg-gray-700/50 hover:text-white">
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="h-8 w-8 p-0 border border-gray-600/50 rounded-md hover:bg-gray-800/30 backdrop-blur-sm text-gray-300">
                            <MoreHorizontal className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-gray-800/90 backdrop-blur-xl border-gray-700">
                            <DropdownMenuItem onClick={() => copyShareUrl(form._id)} className="text-gray-300 hover:bg-gray-700/50">
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Link
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleNativeShare(form)} className="text-gray-300 hover:bg-gray-700/50">
                              <Share2 className="w-4 h-4 mr-2" />
                              Share...
                            </DropdownMenuItem>
                            <div className="flex gap-2 px-4 py-2">
                              <WhatsappShareButton url={`${window.location.origin}/form/${form._id}`}>
                                <WhatsappIcon size={28} round />
                              </WhatsappShareButton>
                              <TwitterShareButton url={`${window.location.origin}/form/${form._id}`}>
                                <TwitterIcon size={28} round />
                              </TwitterShareButton>
                              <FacebookShareButton url={`${window.location.origin}/form/${form._id}`}>
                                <FacebookIcon size={28} round />
                              </FacebookShareButton>
                              <LinkedinShareButton url={`${window.location.origin}/form/${form._id}`}>
                                <LinkedinIcon size={28} round />
                              </LinkedinShareButton>
                            </div>
                            <DropdownMenuItem onClick={() => duplicateForm(form)} className="text-gray-300 hover:bg-gray-700/50">
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-gray-300 hover:bg-gray-700/50">
                              <Download className="w-4 h-4 mr-2" />
                              Export Data
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-gray-300 hover:bg-gray-700/50">
                              <Archive className="w-4 h-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteForm(form._id)} className="text-red-400 hover:bg-gray-700/50">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          )}
        </div>
    </div>
  )
}