<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MaintenanceController extends Controller {
    private $file;
    public function __construct() {
        $this->file = storage_path('framework/maintenance_config.json');
    }

    public function index() {
        $config = file_exists($this->file) ? json_decode(file_get_contents($this->file), true) : null;
        // Jika tidak lagi maintenance atau cuma lockdown transaksi, balikkan ke home
        if (!$config || !($config['manual'] ?? false) || ($config['mode'] ?? 'total') === 'transaksi') {
            return redirect('/');
        }
        return Inertia::render('Maintenance', ['message' => $config['message'] ?? 'Sedang Pemeliharaan Sistem']);
    }

    public function adminPage() {
        $config = file_exists($this->file) ? json_decode(file_get_contents($this->file), true) : [
            'manual' => false, 
            'mode' => 'total', // Default mode
            'message' => 'MilaStore sedang upgrade sistem untuk kenyamanan Sultan.',
            'whitelist' => '',
            'start' => '', 
            'end' => ''
        ];
        return Inertia::render('Admin/MaintenanceSettings', ['config' => $config]);
    }

    public function save(Request $request) {
        try {
            $config = [
                'manual' => filter_var($request->manual, FILTER_VALIDATE_BOOLEAN),
                'mode' => $request->mode ?? 'total',
                'message' => $request->message ?? 'Sedang Pemeliharaan Sistem',
                'whitelist' => $request->whitelist ?? '',
                'start' => $request->start ?? '',
                'end' => $request->end ?? '',
            ];
            file_put_contents($this->file, json_encode($config));
            return response()->json(['status' => 'success', 'message' => 'Mode ' . strtoupper($config['mode']) . ' Tersimpan!']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}
