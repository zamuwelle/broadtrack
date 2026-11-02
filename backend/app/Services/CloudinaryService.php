<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class CloudinaryService
{
	protected $cloudName;
	protected $apiKey;
	protected $apiSecret;

	public function __construct()
	{
		$this->cloudName = config('services.cloudinary.cloud_name');
		$this->apiKey = config('services.cloudinary.api_key');
		$this->apiSecret = config('services.cloudinary.api_secret');
	}

	public function upload($file, $folder = 'broadtrack')
	{
		$timestamp = now()->timestamp;
		$signature = $this->generateSignature(['folder' => $folder, 'timestamp' => $timestamp]);

		$filePath = $file instanceof \Illuminate\Http\UploadedFile ? $file->getRealPath() : $file;
		$fileName = $file instanceof \Illuminate\Http\UploadedFile ? $file->getClientOriginalName() : basename($file);

		$response = Http::attach('file', file_get_contents($filePath), $fileName)
			->post("https://api.cloudinary.com/v1_1/{$this->cloudName}/image/upload", [
				'api_key' => $this->apiKey,
				'timestamp' => $timestamp,
				'folder' => $folder,
				'signature' => $signature,
			]);

		return $response->json();
	}

	public function destroy($publicId)
	{
		$timestamp = now()->timestamp;
		$signature = $this->generateSignature(['public_id' => $publicId, 'timestamp' => $timestamp]);

		$response = Http::post("https://api.cloudinary.com/v1_1/{$this->cloudName}/image/destroy", [
			'api_key' => $this->apiKey,
			'timestamp' => $timestamp,
			'public_id' => $publicId,
			'signature' => $signature,
		]);

		return $response->json();
	}

	protected function generateSignature($params)
	{
		ksort($params);
		$toSign = '';
		foreach ($params as $key => $value) {
			$toSign .= "{$key}={$value}&";
		}
		return sha1(rtrim($toSign, '&') . $this->apiSecret);
	}
}
