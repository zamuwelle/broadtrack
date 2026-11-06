<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\BookingStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\StoreUserRequest;
use App\Http\Requests\Api\V1\UpdateUserRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class UserController extends ApiController
{
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $users = User::where('role', '!=', UserRole::Sysadmin->value)
            ->orderBy('id', 'asc')
            ->get();

        return $this->success(UserResource::collection($users));
    }

    public function show(User $user): JsonResponse
    {
        $this->authorize('view', $user);

        return $this->success(new UserResource($user));
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $this->authorize('create', User::class);

        $validated = $request->validated();
        $validated['email_verified_at'] = now();

        $user = DB::transaction(static function () use ($validated): User {
            $deletedUser = User::onlyTrashed()->where('email', $validated['email'])->lockForUpdate()->first();
            if (! $deletedUser) {
                return User::create($validated);
            }

            $deletedUser->fill(array_merge($validated, [
                'department' => $validated['department'] ?? null,
                'profile_picture' => null,
                'verification_code' => null,
                'verification_sent_at' => null,
            ]));
            $deletedUser->restore();

            return $deletedUser;
        });

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

        return DB::transaction(function () use ($user): JsonResponse {
            $bookings = $user->bookings()->whereIn('status', [BookingStatus::Pending, BookingStatus::Approved])
                ->orderBy('id')->lockForUpdate()->get();

            if ($bookings->contains(static fn (Booking $booking): bool => $booking->status === BookingStatus::Approved)) {
                return $this->error('Cannot delete a user with approved bookings.', 422);
            }

            $bookings->each(static fn (Booking $booking): bool => $booking->cancel());
            $user->tokens()->delete();
            $user->delete();

            return $this->noContent();
        });
    }
}
