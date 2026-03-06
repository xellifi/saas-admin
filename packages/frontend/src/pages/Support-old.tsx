import React, { useState, useEffect } from 'react'
import { 
  HelpCircle, 
  Plus, 
  Search, 
  Filter, 
  MessageSquare, 
  Clock, 
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Reply,
  Archive
} from 'lucide-react'
import { SupportTicket } from '@/types'

const Support: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: 'technical' as 'technical' | 'billing' | 'feature' | 'other'
  })

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = searchTerm === '' || 
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === '' || ticket.status === selectedStatus
    const matchesPriority = selectedPriority === '' || ticket.priority === selectedPriority
    const matchesCategory = selectedCategory === '' || ticket.category === selectedCategory
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })

  const handleCreateTicket = () => {
    const newTicket: SupportTicket = {
      id: Date.now(),
      ticketNumber: `SUP-2024-${String(tickets.length + 1).padStart(3, '0')}`,
      subject: formData.subject,
      description: formData.description,
      status: 'open',
      priority: formData.priority,
      category: formData.category,
      userId: 1, // Current user ID
      userEmail: 'current.user@example.com',
      userName: 'Current User',
      assignedTo: null,
      assignedToName: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolvedAt: null
    }

    setTickets([newTicket, ...tickets])
    setShowCreateModal(false)
    setFormData({
      subject: '',
      description: '',
      priority: 'medium',
      category: 'technical'
    })
  }

  const handleUpdateTicketStatus = (ticketId: number, newStatus: string) => {
    setTickets(tickets.map(ticket => 
      ticket.id === ticketId 
        ? { 
            ...ticket, 
            status: newStatus as any,
            updatedAt: new Date().toISOString(),
            resolvedAt: newStatus === 'resolved' ? new Date().toISOString() : null
          }
        : ticket
    ))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-primary-500" />
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
      case 'in_progress':
        return 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
      case 'resolved':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
      case 'low':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage customer support tickets and requests
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary btn-md flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Ticket</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Open</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.open}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inProgress}</p>
            </div>
            <Clock className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.resolved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline btn-md flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="input"
                >
                  <option value="">All Status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div>
                <label className="label">Priority</label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="input"
                >
                  <option value="">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="label">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input"
                >
                  <option value="">All Categories</option>
                  <option value="technical">Technical</option>
                  <option value="billing">Billing</option>
                  <option value="feature">Feature Request</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tickets List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4 font-medium text-gray-900 dark:text-white">Ticket</th>
                <th className="text-left p-4 font-medium text-gray-900 dark:text-white">Subject</th>
                <th className="text-left p-4 font-medium text-gray-900 dark:text-white">User</th>
                <th className="text-left p-4 font-medium text-gray-900 dark:text-white">Priority</th>
                <th className="text-left p-4 font-medium text-gray-900 dark:text-white">Status</th>
                <th className="text-left p-4 font-medium text-gray-900 dark:text-white">Created</th>
                <th className="text-left p-4 font-medium text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(ticket.status)}
                      <span className="font-mono text-sm">{ticket.ticketNumber}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{ticket.subject}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {ticket.description}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{ticket.userName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{ticket.userEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full flex items-center space-x-1 ${getStatusColor(ticket.status)}`}>
                      {getStatusIcon(ticket.status)}
                      <span>{ticket.status.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="btn btn-outline btn-sm"
                      >
                        <MessageSquare className="w-3 h-3" />
                      </button>
                      {ticket.status !== 'resolved' && (
                        <button
                          onClick={() => handleUpdateTicketStatus(ticket.id, 'resolved')}
                          className="btn btn-outline btn-sm text-green-600"
                        >
                          <CheckCircle className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Create New Support Ticket
            </h2>

            <div className="space-y-6">
              <div>
                <label className="label">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="input"
                  placeholder="Brief description of the issue..."
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input"
                  rows={6}
                  placeholder="Detailed description of the issue..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                    className="input"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="label">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                    className="input"
                  >
                    <option value="technical">Technical</option>
                    <option value="billing">Billing</option>
                    <option value="feature">Feature Request</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn btn-outline btn-md"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTicket}
                className="btn btn-primary btn-md"
              >
                Create Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedTicket.ticketNumber}
              </h2>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Subject</h3>
                <p className="text-gray-600 dark:text-gray-400">{selectedTicket.subject}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                <p className="text-gray-600 dark:text-gray-400">{selectedTicket.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Priority</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <span className={`px-2 py-1 text-xs rounded-full flex items-center space-x-1 ${getStatusColor(selectedTicket.status)}`}>
                    {getStatusIcon(selectedTicket.status)}
                    <span>{selectedTicket.status.replace('_', ' ')}</span>
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">{selectedTicket.category}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(selectedTicket.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(selectedTicket.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedTicket.status !== 'resolved' && (
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'resolved')}
                    className="btn btn-primary btn-md flex items-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark as Resolved</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SupportPage
