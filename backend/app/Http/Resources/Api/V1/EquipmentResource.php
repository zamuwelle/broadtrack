<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EquipmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'name' => $this->name,
            'brand' => $this->brand,
            'model' => $this->model,
            'serial_no' => $this->serial_no,
            'status' => $this->status,
            'image' => $this->image,
            'description' => $this->description,
            'specs' => $this->specs,
        ];
    }
}
