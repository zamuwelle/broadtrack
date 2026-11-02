<?php

namespace App\Http\Controllers;

use App\Models\Location;
use Illuminate\Support\Facades\Cache;

class LocationController extends Controller
{
	public function index()
	{
		$locations = Cache::remember('locations', 300, fn() => Location::select('id', 'name', 'floor')->get());
		return $this->success($locations);
	}

	public function store()
	{
		$validated = request()->validate([
			'name' => 'required|string|max:255',
			'floor' => 'required|string|max:255',
		]);

		Cache::forget('locations');
		return $this->success(Location::create($validated), 'Location created', 201);
	}

	public function update($id)
	{
		$location = Location::sole($id);

		$validated = request()->validate([
			'name' => 'required|string|max:255',
			'floor' => 'required|string|max:255',
		]);

		$location->update($validated);
		Cache::forget('locations');
		return $this->success($location, 'Location updated');
	}

	public function destroy($id)
	{
		Location::sole($id)->delete();
		Cache::forget('locations');
		return $this->success(null, 'Location deleted');
	}
}
