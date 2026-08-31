<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ticket_id' => $this->ticket_id,
            'user_id' => $this->user_id,
            'user' => new UserResource($this->whenLoaded('user')),
            'equipments' => EquipmentResource::collection($this->whenLoaded('equipments')),
            'returned_by_user_id' => $this->returned_by_user_id,
            'returned_by_user' => new UserResource($this->whenLoaded('returnedByUser')),
            'purpose' => $this->purpose,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'return_date' => $this->return_date,
            'status' => $this->status,
            'notes' => $this->notes,
            'approval_note' => $this->approval_note,
            'rejection_reason' => $this->rejection_reason,
            'isRead' => $this->isRead,
            'created_at' => $this->created_at,
        ];
    }
}
