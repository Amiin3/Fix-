<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;

class OrderController extends Controller {
    public function index() {
        return redirect()->back()->with('error', 'Menu ini sudah dinonaktifkan.');
    }
    public function process(Request $request) {
        return redirect()->back();
    }
}
