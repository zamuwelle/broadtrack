<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;

class CloudinaryService
{
    protected $cloudName;
    protected $apiKey;
    protected $apiSecret;
    protected $folder = 'broadtrack';

    public function __construct()
    {
        $this->cloudName = config('services.cloudinary.cloud_name');
        $this->apiKey = config('services.cloudinary.api_key');
        $this->apiSecret = config('services.cloudinary.api_secret');
    }

    public function upload(string|UploadedFile $file, ?string $rawIdentifier = null): array
    {
        $hashed = $rawIdentifier ? $this->hashIdentifier($rawIdentifier) : null;
        $filePath = $file instanceof UploadedFile ? $file->getRealPath() : $file;
        $fileName = $file instanceof UploadedFile ? $file->getClientOriginalName() : basename($file);

        return $this->client()
            ->attach('file', fopen($filePath, 'r'), $fileName)
            ->post($this->endpoint('upload'), $this->signParameters(array_filter([
                'folder' => $this->folder,
                'format' => 'webp',
                'overwrite' => $hashed ? 'true' : null,
                'public_id' => $hashed,
                'timestamp' => now()->timestamp,
            ])))->json();
    }

    public function destroy(string $rawIdentifier): array
    {
        return $this->client()
            ->post($this->endpoint('destroy'), $this->signParameters([
                'public_id' => "{$this->folder}/{$this->hashIdentifier($rawIdentifier)}",
                'timestamp' => now()->timestamp,
            ]))->json();
    }

    protected function client(): PendingRequest
    {
        return Http::timeout(60)
            ->when(app()->isLocal(), static fn ($client) => $client->withoutVerifying());
    }

    protected function endpoint(string $action): string
    {
        return "https://api.cloudinary.com/v1_1/{$this->cloudName}/image/{$action}";
    }

    protected function signParameters(array $parameters): array
    {
        return array_merge($parameters, [
            'api_key' => $this->apiKey,
            'signature' => $this->generateSignature($parameters),
        ]);
    }

    protected function generateSignature(array $parameters): string
    {
        ksort($parameters);

        return sha1(urldecode(http_build_query($parameters)).$this->apiSecret);
    }

    protected function hashIdentifier(string $rawIdentifier): string
    {
        return substr(hash('sha256', config('app.key').$rawIdentifier), 0, 32);
    }
}
