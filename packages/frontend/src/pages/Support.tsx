import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Inbox,
  TrendingUp,
  Users
} from 'lucide-react'
import { SupportTicket } from '@/types'
import { useConfirmDialog } from '@/contexts/ConfirmDialogContext'
import { toast } from '@/components/ui/Toast'
import Notification from '@/components/ui/Notification'
import { useAuthStore } from '@/stores/auth'

// Redesigned Components
import SupportCard from '@/components/support/SupportCard'

const sortOptions = ['Newest First', 'Oldest First', 'Priority: High']
const filterOptions = ['All', 'Open', 'Resolved', 'High Priority']

const FilterDropdown: React.FC<{ filter: string; setFilter: (v: string) => void }> = ({ filter, setFilter }) => {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(o => !o)}
        className="flex items-center space-x-1 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-xl bg-white dark:bg-gray-800"
      >
        <span>{filter}</span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </button>
      {isOpen && (
        <div className="absolute z-50 top-full mt-1 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 min-w-[160px] py-1 overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
            <p className="text-sm font-bold text-gray-900 dark:text-white">Filter By</p>
          </div>
          {filterOptions.map(opt => (
            <button
              key={opt}
              onClick={() => { setFilter(opt); setIsOpen(false) }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${opt === filter
                ? 'bg-gray-50 dark:bg-gray-700/50 font-semibold text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const SortDropdown: React.FC<{ sortOrder: string; setSortOrder: (v: string) => void }> = ({ sortOrder, setSortOrder }) => {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(o => !o)}
        className="flex items-center space-x-1 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-xl bg-white dark:bg-gray-800"
      >
        <span>{sortOrder}</span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </button>
      {isOpen && (
        <div className="absolute z-50 top-full mt-1 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 min-w-[160px] py-1 overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
            <p className="text-sm font-bold text-gray-900 dark:text-white">Sort By</p>
          </div>
          {sortOptions.map(opt => (
            <button
              key={opt}
              onClick={() => { setSortOrder(opt); setIsOpen(false) }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${opt === sortOrder
                ? 'bg-gray-50 dark:bg-gray-700/50 font-semibold text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const Support: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState('Newest First')
  const [filterStatus, setFilterStatus] = useState('All')
  const { confirm } = useConfirmDialog()
  const { user: currentUser } = useAuthStore()

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: 'general',
    priority: 'medium'
  })

  // Fetch tickets from API
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const userId = currentUser?.id
      const role = currentUser?.role
      const response = await fetch(`/api/support/tickets?userId=${userId}&role=${role}`)
      if (!response.ok) throw new Error('Failed to fetch support tickets')
      const data = await response.json()
      setTickets(data.tickets || [])
    } catch (err) {
      console.error('Error fetching tickets:', err)
      setError('Failed to load support tickets')
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  // Create ticket handler
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTicket, userId: currentUser.id })
      })
      if (!response.ok) throw new Error('Failed to create ticket')
      toast.push(<Notification title="Success" type="success">Support ticket created successfully!</Notification>)
      setIsCreateModalOpen(false)
      setNewTicket({ subject: '', description: '', category: 'general', priority: 'medium' })
      fetchTickets()
    } catch (err: any) {
      toast.push(<Notification title="Error" type="danger">{err.message}</Notification>)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTicket = async (ticket: SupportTicket) => {
    await confirm({
      title: 'Delete Ticket',
      message: `Are you sure you want to delete ticket "${ticket.ticketNumber}"?`,
      confirmText: 'Delete Ticket',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/support/tickets/${ticket.id}`, { method: 'DELETE' })
          if (!response.ok) throw new Error('Failed to delete ticket')
          setTickets(prev => prev.filter(t => t.id !== ticket.id))
          toast.push(<Notification title="Success" type="success">Ticket deleted!</Notification>)
        } catch (error) {
          toast.push(<Notification title="Error" type="danger">Failed to delete ticket</Notification>)
        }
      }
    })
  }

  const filteredTickets = tickets.filter(ticket =>
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Support Tickets</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Manage and respond to customer support requests.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Ticket
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="card p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <MessageSquare className="w-6 h-6 text-gray-900 dark:text-white" />
            <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Tickets</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{tickets.length}</h3>
        </div>

        <div className="card p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Inbox className="w-6 h-6 text-gray-900 dark:text-white" />
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">+12%</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Open</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {tickets.filter(t => {
              const s = (t as any)?.status?.toLowerCase?.() || '';
              return !(s === 'closed' || s === 'resolved' || s === 'completed');
            }).length}
          </h3>
        </div>

        <div className="card p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-6 h-6 text-gray-900 dark:text-white" />
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">+8%</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Resolved</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {tickets.filter(t => {
              const s = (t as any)?.status?.toLowerCase?.() || '';
              return (s === 'closed' || s === 'resolved' || s === 'completed');
            }).length}
          </h3>
        </div>

        <div className="card p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-6 h-6 text-gray-900 dark:text-white" />
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">+18%</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">High Priority</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {tickets.filter(t => {
              const p = (t as any)?.priority?.toLowerCase?.() || '';
              return p === 'high' || p === 'urgent';
            }).length}
          </h3>
        </div>

        <div className="card p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-6 h-6 text-gray-900 dark:text-white" />
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">+5%</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Responses</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">--</h3>
        </div>
      </div>

      {/* Main Content Row - Ticket List + Sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Search + Ticket List */}
        <div className="flex-1 space-y-4">
          {/* Search and Filters Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">All tickets</h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <FilterDropdown filter={filterStatus} setFilter={setFilterStatus} />
              </div>
              <div className="relative">
                <SortDropdown sortOrder={sortOrder} setSortOrder={setSortOrder} />
              </div>
            </div>
          </div>

          {/* Ticket List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="card p-6 text-center text-red-500 rounded-2xl border-gray-100 dark:border-gray-700">{error}</div>
          ) : filteredTickets.length === 0 ? (
            <div className="card p-12 text-center text-gray-500 rounded-2xl border-gray-100 dark:border-gray-700">No tickets found.</div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map(ticket => (
                <SupportCard
                  key={ticket.id}
                  ticket={ticket}
                  onDelete={() => handleDeleteTicket(ticket)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Ticket Categories + Support Agent (stacked vertically) */}
        <div className="w-full lg:w-72 space-y-6">
          {/* Ticket Categories */}
          <div className="card h-fit rounded-2xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">Ticket Categories</h2>
            </div>
            <div className="p-2 space-y-1">
              {['Piaf able', 'Pro able', 'CRM admin', 'Alpha pro', 'Carbon able'].map((cat, idx) => (
                <div key={idx} className="group flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-600">
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{cat}</span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">3</span>
                </div>
              ))}
            </div>
          </div>

          {/* Support Agent */}
          <div className="card h-fit rounded-2xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">Support Agent</h2>
            </div>
            <div className="p-2 space-y-1">
              {[
                { name: 'Tom Cook', initial: 'TC', unread: 1 },
                { name: 'Brad Larry', initial: 'BL', unread: 1 },
                { name: 'Jhon White', initial: 'JW' },
                { name: 'Mark Jobs', initial: 'MJ' },
                { name: 'Robert Alia', initial: 'RA' }
              ].map((agent, idx) => (
                <div key={idx} className="group flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-600">
                      {agent.initial}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{agent.name}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {agent.unread ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 text-[10px] font-bold">
                        {agent.unread}
                      </span>
                    ) : null}
                    <span className="text-xs text-gray-400 font-medium">3</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md my-8 animate-in fade-in zoom-in duration-200 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Support Ticket</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <Plus className="w-5 h-5 text-gray-500 transform rotate-45" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="What can we help you with?"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white"
                  >
                    <option value="general">General</option>
                    <option value="billing">Billing</option>
                    <option value="technical">Technical</option>
                    <option value="feature_request">Feature Request</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  required
                  rows={4}
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Please provide as much detail as possible..."
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isSubmitting ? 'Creating...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Support
