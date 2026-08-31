<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\StoreUserRequest;
use App\Http\Requests\Api\V1\UpdateUserRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class UserController extends ApiController
{
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $users = User::orderBy('id', 'asc')->get();

        return $this->success(UserResource::collection($users));
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $this->authorize('create', User::class);

        $validated = $request->validated();
        $validated['email_verified_at'] = now();

        $user = User::create($validated);

        return $this->created(new UserResource($user), 'User created successfully.');
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);

        $user->update($request->validated());

        return $this->success(new UserResource($user), 'User updated successfully.');
    }

    public function destroy(User $user): JsonResponse
    {
        $this->authorize('delete', $user);

        $user->delete();

        return $this->noContent();
    }
}
