<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\BookingStatus;
use App\Enums\EquipmentStatus;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\ImageRequest;
use App\Http\Requests\Api\V1\StoreEquipmentRequest;
use App\Http\Requests\Api\V1\UpdateEquipmentRequest;
use App\Http\Resources\Api\V1\EquipmentResource;
use App\Models\Booking;
use App\Models\Equipment;
use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class EquipmentController extends ApiController
{
    public function index(): JsonResponse
    {
        $equipmentList = Equipment::select('id', 'category', 'name', 'brand', 'model', 'serial_no', 'status', 'image', 'description', 'specs', 'updated_at')
            ->get();

        return $this->success(EquipmentResource::collection(Equipment::resolveStatuses($equipmentList)));
    }

    public function show(Equipment $equipment): JsonResponse
    {
        $resolved = Equipment::resolveStatuses(collect([$equipment]))->first();

        return $this->success(new EquipmentResource($resolved));
    }

    public function store(StoreEquipmentRequest $request): JsonResponse
    {
        $this->authorize('manage', Equipment::class);

        $validated = $request->validated();
        $validated['status'] ??= EquipmentStatus::Available->value;

        $equipment = Equipment::create($validated);

        return $this->created(new EquipmentResource($equipment), 'Equipment created successfully.');
    }

    public function update(UpdateEquipmentRequest $request, Equipment $equipment): JsonResponse
    {
        $this->authorize('manage', Equipment::class);

        return DB::transaction(function () use ($request, $equipment): JsonResponse {
            $lockedEquipment = Equipment::whereKey($equipment->id)->lockForUpdate()->firstOrFail();
            $validated = $request->validated();

            if (isset($validated['status'])) {
                $newStatus = EquipmentStatus::from($validated['status']);
                $hasActiveBookings = $lockedEquipment->bookings()->active()->lockForUpdate()->exists();
                $isCurrentlyBooked = $lockedEquipment->status === EquipmentStatus::Booked || $hasActiveBookings;

                if ($isCurrentlyBooked && in_array($newStatus, [EquipmentStatus::Available, EquipmentStatus::Borrowed], true)) {
                    return $this->error('Cannot change status while equipment is currently booked.', 422);
                }

                if ($newStatus === EquipmentStatus::Booked && ! $hasActiveBookings) {
                    return $this->error('Equipment can only be marked as booked through an approved booking.', 422);
                }

                if ($newStatus === EquipmentStatus::Maintenance) {
                    $affectedBookings = $lockedEquipment->bookings()
                        ->whereIn('bookings.status', [BookingStatus::Pending, BookingStatus::Approved])
                        ->lockForUpdate()
                        ->get();

                    foreach ($affectedBookings as $booking) {
                        assert($booking instanceof Booking);
                        $booking->reject('Equipment is under maintenance.');
                    }
                }
            }

            $lockedEquipment->update($validated);
            $resolved = Equipment::resolveStatuses(collect([$lockedEquipment]))->first();

            return $this->success(new EquipmentResource($resolved), 'Equipment updated successfully.');
        });
    }

    public function upload(ImageRequest $request, Equipment $equipment, CloudinaryService $cloudinary): JsonResponse
    {
        $this->authorize('manage', Equipment::class);

        $uploadResult = $cloudinary->upload($request->file('image'), $equipment->imagePublicId());

        if (! isset($uploadResult['secure_url'])) {
            return $this->error('Upload failed.', 500);
        }

        $equipment->update(['image' => $uploadResult['secure_url']]);

        return $this->success(new EquipmentResource($equipment), 'Image uploaded successfully.');
    }

    public function destroy(Equipment $equipment, CloudinaryService $cloudinary): JsonResponse
    {
        $this->authorize('manage', Equipment::class);

        return DB::transaction(function () use ($equipment, $cloudinary) {
            $lockedEquipment = Equipment::where('id', $equipment->id)->lockForUpdate()->first();

            if (! $lockedEquipment) {
                return $this->error('Cannot delete equipment that has associated booking records.', 422);
            }

            if ($lockedEquipment->status === EquipmentStatus::Booked || $lockedEquipment->status === EquipmentStatus::Borrowed) {
                return $this->error('Cannot delete equipment that is currently booked or borrowed.', 422);
            }

            if ($lockedEquipment->bookings()->exists()) {
                return $this->error('Cannot delete equipment that has associated booking records.', 422);
            }

            if ($lockedEquipment->image && $cloudinary->ownsImage($lockedEquipment->image, $lockedEquipment->imagePublicId())) {
                $cloudinary->destroy($lockedEquipment->imagePublicId());
            }

            $lockedEquipment->delete();

            return $this->noContent();
        });
    }
}
