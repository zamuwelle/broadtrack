<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

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
            'date_range_label' => $this->formatDateRangeLabel($this->start_date, $this->end_date),
            'date_time_range_label' => $this->formatDateTimeRangeLabel($this->start_date, $this->end_date),
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

    private function formatDateRangeLabel(?Carbon $startDate, ?Carbon $endDate): string
    {
        if (! $startDate) {
            return '---';
        }

        $startDate = $startDate->copy()->timezone('Asia/Manila');

        if (! $endDate) {
            return $startDate->format('F j, Y');
        }

        $endDate = $endDate->copy()->timezone('Asia/Manila');
        $startMonth = $startDate->format('F');
        $endMonth = $endDate->format('F');
        $startYear = $startDate->format('Y');
        $endYear = $endDate->format('Y');
        $startDay = $startDate->format('j');
        $endDay = $endDate->format('j');

        if ($startMonth === $endMonth && $startYear === $endYear) {
            if ($startDay === $endDay) {
                return "{$startMonth} {$startDay}, {$startYear}";
            }

            return "{$startMonth} {$startDay}-{$endDay}, {$startYear}";
        }

        return "{$startMonth} {$startDay}, {$startYear} – {$endMonth} {$endDay}, {$endYear}";
    }

    private function formatDateTimeRangeLabel(?Carbon $startDate, ?Carbon $endDate): string
    {
        return $this->formatDateTimeLabel($startDate).' – '.$this->formatDateTimeLabel($endDate);
    }

    private function formatDateTimeLabel(?Carbon $date): string
    {
        if (! $date) {
            return '';
        }

        return $date->copy()->timezone('Asia/Manila')->format('F j, Y, h:i A');
    }
}
