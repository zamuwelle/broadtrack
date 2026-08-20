<?php

namespace App\Http\Controllers;

use App\Enums\BookingStatus;
use App\Enums\EquipmentStatus;
use App\Events\EquipmentUpdated;
use App\Http\Requests\Api\V1\ImageRequest;
use App\Http\Requests\Api\V1\StoreEquipmentRequest;
use App\Http\Requests\Api\V1\UpdateEquipmentRequest;
use App\Models\Booking;
use App\Models\Equipment;
use App\Services\CloudinaryService;
use Illuminate\Support\Facades\Cache;

class EquipmentController extends Controller
{
    public function index()
    {
        $equipmentList = Cache::remember('equipment_list', 86400, static fn () => Equipment::with('category:id,name')
            ->select('id', 'category_id', 'name', 'brand', 'model', 'serial_no', 'status', 'image', 'description', 'specs')
            ->get()
            ->toArray()
        );

        return $this->success($this->resolveStatuses($equipmentList));
    }

    private function resolveStatuses(array $equipmentItems)
    {
        $bookingsByEquipmentId = Booking::with('equipments:id')
            ->whereIn('status', [BookingStatus::Approved, BookingStatus::Released])
            ->get()
            ->flatMap(static fn (Booking $booking) => $booking->equipments
                ->map(static fn (Equipment $equipment) => ['id' => $equipment->id, 'booking' => $booking]))
            ->groupBy('id')
            ->map->pluck('booking');

        return collect($equipmentItems)->map(static function (array $item) use ($bookingsByEquipmentId) {
            if ($item['status'] !== EquipmentStatus::Available->value) {
                return $item;
            }

            $bookings = $bookingsByEquipmentId->get($item['id'], collect());
            $hasStarted = static fn (Booking $booking) => $booking->start_date->lessThanOrEqualTo(now());

            $item['status'] = (match (true) {
                $bookings->contains($hasStarted) => EquipmentStatus::Borrowed,
                $bookings->isNotEmpty() => EquipmentStatus::Booked,
                default => EquipmentStatus::Available,
            })->value;

            return $item;
        })->all();
    }

    public function store(StoreEquipmentRequest $request)
    {
        $validated = $request->validated();

        $validated['status'] ??= 'available';

        Cache::forget('equipment_list');
        $equipment = Equipment::create($validated);
        $equipment->load('category:id,name');
        broadcast(new EquipmentUpdated('created', $equipment->id));

        return $this->success($equipment, 'Equipment created', 201);
    }

    public function update(UpdateEquipmentRequest $request, $id)
    {
        $equipment = Equipment::findOrFail($id);

        $validated = $request->validated();

        $equipment->update($validated);
        $equipment->load('category:id,name');
        Cache::forget('equipment_list');
        broadcast(new EquipmentUpdated('updated', $equipment->id));

        return $this->success($equipment, 'Equipment updated');
    }

    public function upload(ImageRequest $request, $id)
    {
        $equipment = Equipment::findOrFail($id);

        $cloudinaryService = new CloudinaryService;
        $rawIdentifier = strtolower($equipment->serial_no ?: "equipment-{$equipment->id}");
        $uploadResult = $cloudinaryService->upload(request()->file('image'), $rawIdentifier);

        if (! isset($uploadResult['secure_url'])) {
            return $this->error('Upload failed', 500);
        }

        Cache::forget('equipment_list');
        $equipment->update(['image' => $uploadResult['secure_url']]);
        broadcast(new EquipmentUpdated('updated', $equipment->id));

        return $this->success($equipment, 'Image uploaded');
    }

    public function destroy($id)
    {
        $equipment = Equipment::findOrFail($id);
        if ($equipment->image) {
            $rawIdentifier = strtolower($equipment->serial_no ?: "equipment-{$equipment->id}");
            (new CloudinaryService)->destroy($rawIdentifier);
        }

        Cache::forget('equipment_list');
        $equipment->delete();
        broadcast(new EquipmentUpdated('deleted', (int)$id));

        return $this->success(null, 'Equipment deleted');
    }
}
