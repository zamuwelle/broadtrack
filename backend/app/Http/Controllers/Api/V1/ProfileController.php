<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\ImageRequest;
use App\Http\Requests\Api\V1\UpdateProfileRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends ApiController
{
    public function show(Request $request): JsonResponse
    {
        return $this->success(new UserResource($request->user()));
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = $request->user();
        $user->update($validated);

        return $this->success(new UserResource($user), 'Profile updated successfully.');
    }

    public function uploadPicture(ImageRequest $request, CloudinaryService $cloudinary): JsonResponse
    {
        $user = $request->user();
        $rawIdentifier = "user-{$user->id}";
        $uploadResult = $cloudinary->upload($request->file('image'), $rawIdentifier);

        if (! isset($uploadResult['secure_url'])) {
            return $this->error('Upload failed.', 500);
        }

        $user->update(['profile_picture' => $uploadResult['secure_url']]);

        return $this->success(new UserResource($user), 'Profile picture updated successfully.');
    }
}
