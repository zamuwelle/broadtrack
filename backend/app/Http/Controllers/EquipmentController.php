<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use App\Services\CloudinaryService;
use Illuminate\Support\Facades\Cache;

class EquipmentController extends Controller
{
	public function index()
	{
		$equipment = Cache::remember('equipment_list', 60, fn() =>			Equipment::with(['category:id,name', 'location:id,name,floor'])
				->select('id', 'category_id', 'location_id', 'name', 'brand', 'model', 'serial_no', 'quantity', 'status', 'image', 'description', 'specs')
				->get()
				->toArray()
		);
		return $this->success($equipment);
	}

	public function show($id)
	{
		return $this->success(Equipment::with(['category', 'location'])->sole($id));
	}

	public function store()
	{
		$validated = request()->validate([
			'category_id' => 'required|exists:categories,id',
			'location_id' => 'nullable|exists:locations,id',
			'name' => 'required|string|max:255',
			'brand' => 'nullable|string|max:255',
			'model' => 'nullable|string|max:255',
			'quantity' => 'required|integer|min:1',
			'status' => 'required|string',
			'description' => 'nullable|string',
			'specs' => 'nullable|string',
			'image' => 'nullable|string|max:255',
		]);

		Cache::forget('equipment_list');
		return $this->success(Equipment::create($validated), 'Equipment created', 201);
	}

	public function update($id)
	{
		$equipment = Equipment::sole($id);

		$validated = request()->validate([
			'category_id' => 'sometimes|required|exists:categories,id',
			'location_id' => 'nullable|exists:locations,id',
			'name' => 'sometimes|required|string|max:255',
			'brand' => 'nullable|string|max:255',
			'model' => 'nullable|string|max:255',
			'quantity' => 'sometimes|required|integer|min:1',
			'status' => 'sometimes|required|string',
			'description' => 'nullable|string',
			'specs' => 'nullable|string',
			'image' => 'nullable|string|max:255',
		]);

		$equipment->update($validated);
		Cache::forget('equipment_list');
		return $this->success($equipment, 'Equipment updated');
	}

	public function upload($id)
	{
		$equipment = Equipment::sole($id);

		request()->validate([
			'image' => 'required|image|max:5120',
		]);

		$cloudinary = new CloudinaryService();
		$result = $cloudinary->upload(request()->file('image'), 'broadtrack/equipment');

		if (!isset($result['secure_url'])) {
			return $this->error('Upload failed', 500);
		}

		$equipment->update(['image' => $result['secure_url']]);

		return $this->success($equipment, 'Image uploaded');
	}

	public function destroy($id)
	{
		Equipment::sole($id)->delete();

		return $this->success(null, 'Equipment deleted');
	}
}
