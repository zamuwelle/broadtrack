<?php

namespace App\Http\Controllers;

use App\Events\UserUpdated;
use App\Http\Requests\Api\V1\StoreUserRequest;
use App\Http\Requests\Api\V1\UpdateUserRequest;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

class UserController extends Controller
{
    public function index()
    {
        $users = Cache::remember('user_list', 86400, static fn () => User::orderBy('id', 'asc')->get()->toArray());

        return $this->success($users);
    }

    public function store(StoreUserRequest $request)
    {
        $validated = $request->validated();

        $validated['email_verified_at'] = now();

        $user = User::create($validated);
        Cache::forget('user_list');
        broadcast(new UserUpdated('created', $user->id));

        return $this->success(null, 'User created successfully', 201);
    }

    public function update(UpdateUserRequest $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validated();

        $user->update($validated);
        Cache::forget('user_list');
        broadcast(new UserUpdated('updated', $user->id));

        return $this->success(null, 'User updated successfully');
    }

    public function destroy($id)
    {
        $requestingUser = request()->user();

        if ($requestingUser->id == $id) {
            return $this->error('You cannot remove yourself', 403);
        }

        $user = User::findOrFail($id);
        $user->delete();
        Cache::forget('user_list');
        broadcast(new UserUpdated('deleted', (int)$id));

        return $this->success(null, 'User removed successfully');
    }
}
