<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class MenuManagerController extends Controller {
    private $filePath = 'dynamic_menus.json';

    public function listMenus() {
        if (!Storage::exists($this->filePath)) return response()->json(['status' => 'default']);
        return response()->json(['status' => 'custom', 'data' => json_decode(Storage::get($this->filePath), true)]);
    }

    public function index(Request $request) {
        if (!$request->user() || !in_array($request->user()->level, ['admin', 'owner'])) abort(403);
        return inertia('Admin/ManageMenus');
    }

    public function save(Request $request) {
        Storage::put($this->filePath, json_encode(['admin' => $request->admin, 'app' => $request->app]));
        return response()->json(['success' => true, 'message' => 'Konfigurasi Menu Berhasil Disimpan!']);
    }

    public function uploadIcon(Request $request) {
        try {
            if (!$request->hasFile('icon_file')) return response()->json(['message' => 'File gambar kosong.'], 400);
            
            $file = $request->file('icon_file');
            $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9_.-]/', '', str_replace(' ', '_', $file->getClientOriginalName()));
            
            // 🚀 BYPASS SYMLINK: SIMPAN LANGSUNG KE FOLDER PUBLIC
            $file->move(public_path('menu_icons'), $filename);
            
            return response()->json([
                'success' => true, 
                // URL langsung ke file public
                'url' => asset('menu_icons/' . $filename) 
            ]);
        } catch (\Exception $e) {
            Log::error('Upload Error: ' . $e->getMessage());
            return response()->json(['message' => 'Server Error: ' . $e->getMessage()], 500);
        }
    }
}
