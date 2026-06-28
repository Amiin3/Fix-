<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ThemeSetting;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class ThemeController extends Controller
{
    public function getTheme()
    {
        $theme = ThemeSetting::first() ?? ThemeSetting::create(['bg_type' => 'color_dark', 'bg_value' => 'from-[#1e3a8a] via-[#1d4ed8] to-[#3b82f6]']);
        // Upgrade otomatis tema lama
        if ($theme->bg_type === 'color') {
            $theme->bg_type = 'color_dark';
            $theme->save();
        }
        return response()->json($theme);
    }

    public function saveTheme(Request $request)
    {
        $request->validate([
            'bg_type' => 'required|in:color_dark,color_light,image_upload'
        ]);

        $theme = ThemeSetting::first();
        if (!$theme) $theme = new ThemeSetting();
        
        if ($request->bg_type === 'image_upload') {
            $request->validate(['bg_file' => 'required|image|mimes:jpeg,png,jpg,webp|max:4096']);
            
            $file = $request->file('bg_file');
            $extension = $file->extension();

            if ($theme->bg_type === 'image' && $theme->bg_value) {
                $oldFilePath = public_path(Str::after($theme->bg_value, url('/')));
                if (File::exists($oldFilePath)) File::delete($oldFilePath);
            }

            $filename = time() . '_' . Str::random(10) . '.' . $extension;
            try {
                $file->move(public_path('themes'), $filename);
            } catch (\Exception $e) {
                return response()->json(['errors' => ['server' => ['Gagal pindah file: ' . $e->getMessage()]]], 500);
            }
            
            $theme->bg_type = 'image';
            $theme->bg_value = asset('themes/' . $filename); 
        } else {
            $theme->bg_type = $request->bg_type;
            // Jika pilih Terang, kode defaultnya putih. Jika gelap, biru.
            $theme->bg_value = $request->bg_value ?? ($request->bg_type === 'color_light' ? 'from-white to-slate-50' : 'from-blue-600 to-indigo-600');
        }
        
        $theme->save();

        return response()->json(['success' => true, 'theme' => $theme]);
    }
}
