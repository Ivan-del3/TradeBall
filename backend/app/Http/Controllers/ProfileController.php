<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{

    public function update(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:100',
            'lastname' => 'required|string|max:100',
            'avatar'   => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $user           = $request->user();
        $user->name     = $validated['name'];
        $user->lastname = $validated['lastname'];

        if ($request->hasFile('avatar')) {
            if ($user->avatar_url) {
                $old = str_replace('/storage/', '', $user->avatar_url);
                Storage::disk('public')->delete($old);
            }
            $path             = $request->file('avatar')->store('avatars', 'public');
            $user->avatar_url = config('app.url') . '/storage/' . $path;
        }

        $user->save();
        return response()->json(['user' => $user]);
    }
}