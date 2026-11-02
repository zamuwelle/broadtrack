<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
	public function index()
	{
		$categories = Cache::remember('categories', 300, fn() => Category::select('id', 'name')->get()->toArray());
		return $this->success($categories);
	}

	public function store()
	{
		$validated = request()->validate([
			'name' => 'required|string|max:255|unique:categories',
		]);

		Cache::forget('categories');
		return $this->success(Category::create($validated), 'Category created', 201);
	}

	public function update($id)
	{
		$category = Category::sole($id);

		$validated = request()->validate([
			'name' => "required|string|max:255|unique:categories,name,{$id}",
		]);

		$category->update($validated);
		Cache::forget('categories');
		return $this->success($category, 'Category updated');
	}

	public function destroy($id)
	{
		Category::sole($id)->delete();
		Cache::forget('categories');
		return $this->success(null, 'Category deleted');
	}
}
