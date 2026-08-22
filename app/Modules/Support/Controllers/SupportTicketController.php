<?php

namespace App\Modules\Support\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Support\Models\SupportTicket;
use Illuminate\Http\Request;

class SupportTicketController extends Controller
{
    /**
     * Get all tickets (staff)
     */
    public function index(Request $request)
    {
        try {
            $query = SupportTicket::query();

            // Filter by status
            if ($request->has('status') && $request->status) {
                $query->byStatus($request->status);
            }

            // Filter by priority
            if ($request->has('priority') && $request->priority) {
                $query->byPriority($request->priority);
            }

            // Filter by category
            if ($request->has('category') && $request->category) {
                $query->byCategory($request->category);
            }

            // Search
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('subject', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('ticket_number', 'like', "%{$search}%")
                      ->orWhere('user_email', 'like', "%{$search}%");
                });
            }

            $tickets = $query->recent()->paginate($request->get('per_page', 20));

            return response()->json([
                'success' => true,
                'data' => $tickets,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching tickets',
            ], 500);
        }
    }

    /**
     * Create new ticket (customer)
     */
    public function create(Request $request)
    {
        try {
            $validated = $request->validate([
                'user_name' => 'required|string|max:255',
                'user_email' => 'required|email|max:255',
                'user_phone' => 'required|string|max:20',
                'subject' => 'required|string|max:255',
                'description' => 'required|string|max:2000',
                'category' => 'required|in:' . implode(',', array_keys(SupportTicket::CATEGORIES)),
                'priority' => 'required|in:' . implode(',', array_keys(SupportTicket::PRIORITIES)),
            ]);

            $ticket = SupportTicket::create([
                'ticket_number' => SupportTicket::generateTicketNumber(),
                'user_id' => auth()->id(),
                'user_name' => $validated['user_name'],
                'user_email' => $validated['user_email'],
                'user_phone' => $validated['user_phone'],
                'subject' => $validated['subject'],
                'description' => $validated['description'],
                'category' => $validated['category'],
                'priority' => $validated['priority'],
                'status' => 'open',
            ]);

            // Send confirmation email
            // TODO: Send email to user

            return response()->json([
                'success' => true,
                'message' => 'Ticket created successfully',
                'data' => $ticket,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating ticket',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get single ticket
     */
    public function show(SupportTicket $ticket)
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $ticket,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching ticket',
            ], 500);
        }
    }

    /**
     * Update ticket (staff)
     */
    public function update(Request $request, SupportTicket $ticket)
    {
        try {
            $validated = $request->validate([
                'status' => 'sometimes|in:' . implode(',', array_keys(SupportTicket::STATUSES)),
                'priority' => 'sometimes|in:' . implode(',', array_keys(SupportTicket::PRIORITIES)),
                'assigned_to' => 'sometimes|nullable|string',
                'resolution_notes' => 'sometimes|nullable|string|max:2000',
            ]);

            $ticket->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Ticket updated successfully',
                'data' => $ticket,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating ticket',
            ], 500);
        }
    }

    /**
     * Resolve ticket
     */
    public function resolve(Request $request, SupportTicket $ticket)
    {
        try {
            $validated = $request->validate([
                'resolution_notes' => 'required|string|max:2000',
            ]);

            $ticket->markResolved($validated['resolution_notes']);

            return response()->json([
                'success' => true,
                'message' => 'Ticket resolved successfully',
                'data' => $ticket,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error resolving ticket',
            ], 500);
        }
    }

    /**
     * Close ticket
     */
    public function close(SupportTicket $ticket)
    {
        try {
            $ticket->update(['status' => 'closed']);

            return response()->json([
                'success' => true,
                'message' => 'Ticket closed successfully',
                'data' => $ticket,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error closing ticket',
            ], 500);
        }
    }

    /**
     * Get customer's tickets
     */
    public function myTickets()
    {
        try {
            $tickets = SupportTicket::where('user_id', auth()->id())
                ->orWhere('user_email', auth()->user()->email)
                ->recent()
                ->get();

            return response()->json([
                'success' => true,
                'data' => $tickets,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching tickets',
            ], 500);
        }
    }

    /**
     * Statistics
     */
    public function statistics()
    {
        try {
            $stats = [
                'open_tickets' => SupportTicket::open()->count(),
                'resolved_tickets' => SupportTicket::resolved()->count(),
                'total_tickets' => SupportTicket::count(),
                'by_priority' => SupportTicket::groupBy('priority')
                    ->selectRaw('priority, count(*) as count')
                    ->get(),
                'by_category' => SupportTicket::groupBy('category')
                    ->selectRaw('category, count(*) as count')
                    ->get(),
                'by_status' => SupportTicket::groupBy('status')
                    ->selectRaw('status, count(*) as count')
                    ->get(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching statistics',
            ], 500);
        }
    }
}
