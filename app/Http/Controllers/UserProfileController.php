<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class UserProfileController extends Controller
{
    public function index()
    {
        return Inertia::render('Profile/Index');
    }
}
