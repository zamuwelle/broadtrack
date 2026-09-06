<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $isOwnerOrAdmin = $user && ($user->isAdmin() || $this->user_id === $user->id);

        return [
            'id' => $this->id,
            'ticket_id' => $this->ticket_id,
            'user_id' => $isOwnerOrAdmin ? $this->user_id : null,
            'user' => $isOwnerOrAdmin ? new UserResource($this->whenLoaded('user')) : null,
            'equipments' => EquipmentResource::collection($this->whenLoaded('equipments')),
            'returned_by_user_id' => $isOwnerOrAdmin ? $this->returned_by_user_id : null,
            'returned_by_user' => $isOwnerOrAdmin ? new UserResource($this->whenLoaded('returnedByUser')) : null,
            'purpose' => $isOwnerOrAdmin ? $this->purpose : null,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'return_date' => $this->return_date,
            'status' => $this->status,
            'is_overdue' => $this->is_overdue,
            'approval_note' => $isOwnerOrAdmin ? $this->approval_note : null,
            'rejection_reason' => $isOwnerOrAdmin ? $this->rejection_reason : null,
            'isRead' => $isOwnerOrAdmin ? $this->isRead : false,
            'created_at' => $this->created_at,
        ];
    }
}
