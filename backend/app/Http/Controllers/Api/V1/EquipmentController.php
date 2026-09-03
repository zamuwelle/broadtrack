<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\EquipmentStatus;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\ImageRequest;
use App\Http\Requests\Api\V1\StoreEquipmentRequest;
use App\Http\Requests\Api\V1\UpdateEquipmentRequest;
use App\Http\Resources\Api\V1\EquipmentResource;
use App\Models\Equipment;
use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;

class EquipmentController extends ApiController
{
    public function index(): JsonResponse
    {
        $equipmentList = Equipment::select('id', 'category', 'name', 'brand', 'model', 'serial_no', 'status', 'image', 'description', 'specs')
            ->get();

        return $this->success(EquipmentResource::collection(Equipment::resolveStatuses($equipmentList)));
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

        $equipment->update($request->validated());

        return $this->success(new EquipmentResource($equipment), 'Equipment updated successfully.');
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

        if ($equipment->status === EquipmentStatus::Booked || $equipment->status === EquipmentStatus::Borrowed) {
            return $this->error('Cannot delete equipment that is currently booked or borrowed.', 422);
        }

        if ($equipment->image) {
            $cloudinary->destroy($equipment->imagePublicId());
        }

        $equipment->delete();

        return $this->noContent();
    }
}
