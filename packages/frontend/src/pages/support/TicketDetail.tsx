import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useConfirmDialog } from '@/contexts/ConfirmDialogContext'
import { toast } from '@/components/ui/Toast'
import Notification from '@/components/ui/Notification'
import { useAuthStore } from '@/stores/auth'

// Redesigned Components
import TicketConversation from '@/components/support/TicketConversation'
import TicketDetailsSidebar from '@/components/support/TicketDetailsSidebar'

const TicketDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { confirm } = useConfirmDialog()
    const { user: currentUser } = useAuthStore()

    const [ticketDetail, setTicketDetail] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const fetchTicketDetail = useCallback(async () => {
        if (!id) return
        try {
            setLoading(true)
            const response = await fetch(`/api/support/tickets/${id}`)
            if (!response.ok) throw new Error('Failed to fetch ticket details')
            const data = await response.json()
            setTicketDetail(data.ticket)
        } catch (err) {
            console.error('Error fetching ticket detail:', err)
            toast.push(<Notification title="Error" type="danger">Failed to load conversation</Notification>)
            navigate('/support')
        } finally {
            setLoading(false)
        }
    }, [id, navigate])

    useEffect(() => {
        fetchTicketDetail()
    }, [fetchTicketDetail])

    const handlePostReply = async (message: string) => {
        if (!currentUser || !id) return
        try {
            const response = await fetch(`/api/support/tickets/${id}/replies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id, message, isInternal: false })
            })
            if (!response.ok) throw new Error('Failed to post reply')
            fetchTicketDetail()
            toast.push(<Notification title="Success" type="success">Reply sent!</Notification>)
        } catch (err: any) {
            toast.push(<Notification title="Error" type="danger">{err.message}</Notification>)
        }
    }

    const handleUpdateStatus = async (status: string) => {
        if (!id) return
        try {
            const response = await fetch(`/api/support/tickets/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            })
            if (!response.ok) throw new Error('Failed to update status')
            fetchTicketDetail()
            toast.push(<Notification title="Success" type="success">Ticket {status}!</Notification>)
        } catch (err: any) {
            toast.push(<Notification title="Error" type="danger">{err.message}</Notification>)
        }
    }

    const handleDeleteTicket = async () => {
        if (!ticketDetail) return
        await confirm({
            title: 'Delete Ticket',
            message: `Are you sure you want to delete ticket "${ticketDetail.ticketNumber}"?`,
            confirmText: 'Delete Ticket',
            cancelText: 'Cancel',
            confirmVariant: 'danger',
            onConfirm: async () => {
                try {
                    const response = await fetch(`/api/support/tickets/${id}`, { method: 'DELETE' })
                    if (!response.ok) throw new Error('Failed to delete ticket')
                    toast.push(<Notification title="Success" type="success">Ticket deleted!</Notification>)
                    navigate('/support')
                } catch (error) {
                    toast.push(<Notification title="Error" type="danger">Failed to delete ticket</Notification>)
                }
            }
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    if (!ticketDetail) return null

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Conversation Area */}
            <div className="flex-1 flex flex-col card overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center">
                    <Link
                        to="/support"
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors mr-4"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </Link>
                    <h2 className="text-sm font-medium text-gray-500 font-inter">Back to Tickets</h2>
                </div>

                <div className="flex-1">
                    <TicketConversation
                        ticket={ticketDetail}
                        onPostReply={handlePostReply}
                    />
                </div>
            </div>

            {/* Ticket Details Sidebar */}
            <div className="w-full lg:w-80 h-fit card overflow-hidden">
                <TicketDetailsSidebar
                    ticket={ticketDetail}
                    onUpdateStatus={handleUpdateStatus}
                    onDelete={handleDeleteTicket}
                />
            </div>
        </div>
    )
}

export default TicketDetail
