<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Inertia\Inertia;

class AkrabEngineController extends Controller
{
    private function isAdmin() {
        $user = auth()->user();
        return (isset($user->is_admin) && $user->is_admin == 1) || ($user->level === "admin");
    }

    private function authorizeMsisdn($msisdn) {
        if ($this->isAdmin()) return true; 
        $user = auth()->user();
        return DB::table("pengelola_reseller")->where("msisdn", $msisdn)->where("reseller_id", $user->id)->exists();
    }

    private function callPythonApi($endpoint, $params = [], $timeout = 45) {
        set_time_limit(120);
        $url = "http://138.197.120.9:8888" . $endpoint;
        try {
            $response = Http::timeout($timeout)->get($url, $params);
            return json_decode($response->body(), true) ?? ["success" => false, "error" => "Invalid Response dari Python API"];
        } catch (\Throwable $e) { return ["success" => false, "error" => $e->getMessage()]; }
    }

    public function index(Request $request) {
        set_time_limit(120);
        $user = $request->user();
        $isAdmin = $this->isAdmin();

        $sessionsResponse = $this->callPythonApi("/list_sessions", [], 10);
        $allSessions = $sessionsResponse["data"] ?? [];

        $resellers = User::where("level", "reseller")
                         ->where("id", "!=", $user->id)
                         ->where("level", "!=", "admin")
                         ->orderBy("id", "desc")->get(["id", "name", "email", "api_key", "ip_whitelist"]);
                         
        $mappings = DB::table("pengelola_reseller")->get()->keyBy("msisdn")->toArray();

        $filteredSessions = $isAdmin ? $allSessions : DB::table("pengelola_reseller")->where("reseller_id", $user->id)->pluck("msisdn")->toArray();
        $activeSession = $request->query("session");
        if ($activeSession && !$isAdmin && !in_array($activeSession, $filteredSessions)) $activeSession = null;

        $memberInfo = null; $profile = null; $balance = null; $pythonError = null;
        if ($activeSession) {
            $memberInfo = $this->callPythonApi("/akrab_member_info", ["active_msisdn" => $activeSession, "force" => true], 20);
            if (!($memberInfo["success"] ?? false)) { $pythonError = $memberInfo["error"] ?? "Sesi Terputus"; } 
            else {
                $profile = $this->callPythonApi("/profile", ["active_msisdn" => $activeSession], 10);
                $balance = $this->callPythonApi("/balance", ["active_msisdn" => $activeSession], 10);
            }
        }

        return Inertia::render("Admin/XlkuEngine", [
            "sessions" => $filteredSessions, "activeSession" => $activeSession,
            "memberInfo" => $memberInfo["data"] ?? $memberInfo, "profile" => $profile["data"] ?? $profile,
            "balance" => $balance["data"] ?? $balance, "pythonError" => $pythonError,
            "resellers" => $resellers, "mappings" => $mappings, "isAdmin" => $isAdmin
        ]);
    }

    // MANAJEMEN H2H API
    public function searchUsers(Request $request) {
        if (!$this->isAdmin()) return response()->json([]);
        $q = $request->q;
        if (empty($q)) return response()->json([]);
        $users = User::where("id", "!=", auth()->id())->where("level", "!=", "admin")->where("level", "!=", "reseller")
                     ->where(function($query) use ($q) { $query->where("name", "LIKE", "%{$q}%")->orWhere("email", "LIKE", "%{$q}%"); })
                     ->limit(10)->get(["id", "name", "email", "level", "api_key"]);
        return response()->json($users);
    }

    public function promoteUser(Request $request) {
        if (!$this->isAdmin()) return response()->json(["success" => false, "error" => "Access Denied"]);
        $request->validate(["user_id" => "required"]);
        $user = User::find($request->user_id);
        if (!$user || $user->level === "admin") return response()->json(["success" => false, "error" => "User tidak valid!"]);

        $user->level = "reseller"; 
        if (empty($user->api_key)) $user->api_key = "MILA-AKRAB-" . strtoupper(bin2hex(random_bytes(6)));
        if (empty($user->ip_whitelist)) $user->ip_whitelist = "*";
        $user->save();
        return response()->json([ "success" => true, "message" => "Akses Tenant diberikan ke " . $user->name, "data" => ["id" => $user->id, "name" => $user->name, "email" => $user->email, "api_key" => $user->api_key, "ip_whitelist" => $user->ip_whitelist] ]);
    }

    public function saveApiConfig(Request $request) {
        if (!$this->isAdmin()) return response()->json(["success" => false, "error" => "Access Denied"]);
        $user = User::where("id", $request->user_id)->first();
        if (!$user || $user->level === "admin") return response()->json(["success" => false, "error" => "Akun tidak valid!"]);
        if ($request->has("regenerate_key") && $request->regenerate_key == true) $user->api_key = "MILA-AKRAB-" . strtoupper(bin2hex(random_bytes(6)));
        if ($request->has("ip_whitelist")) $user->ip_whitelist = $request->ip_whitelist;
        $user->save();
        return response()->json(["success" => true, "message" => "Konfigurasi API disimpan!", "api_key" => $user->api_key]);
    }

    public function revokeReseller($id) {
        if (!$this->isAdmin()) return response()->json(["success" => false, "error" => "Access Denied"]);
        if ($id == auth()->id()) return response()->json(["success" => false, "error" => "Tidak bisa cabut akses sendiri!"]);
        try {
            DB::table("pengelola_reseller")->where("reseller_id", $id)->update(["reseller_id" => null, "owner_name" => "BELUM DISEWA"]);
            $user = User::find($id);
            if ($user && $user->level !== "admin") { $user->level = "member"; $user->api_key = null; $user->save(); }
            return response()->json(["success" => true, "message" => "Akses Tenant berhasil dicabut dengan aman!"]);
        } catch (\Throwable $e) { return response()->json(["success" => false, "error" => "Gagal memproses."]); }
    }

    public function assignOwner(Request $request) {
        if (!$this->isAdmin()) return response()->json(["success" => false, "error" => "Access Denied"]);
        $request->validate(["msisdn" => "required"]);
        if (empty($request->reseller_id)) {
            DB::table("pengelola_reseller")->where("msisdn", $request->msisdn)->delete();
            return response()->json(["success" => true, "message" => "Hak sewa dicabut (Sesi Bebas)."]);
        }
        $reseller = User::find($request->reseller_id);
        if (!$reseller) return response()->json(["success" => false, "error" => "Reseller tidak valid!"]);
        DB::table("pengelola_reseller")->updateOrInsert(["msisdn" => $request->msisdn], ["reseller_id" => $reseller->id, "owner_name" => $reseller->name, "updated_at" => now()]);
        return response()->json(["success" => true, "message" => "Hak sewa diberikan ke " . $reseller->name]);
    }

    // MANAJEMEN AKRAB (FITUR LENGKAP)
    public function requestOtp(Request $request) { 
        if (!$this->isAdmin()) return response()->json(["success" => false, "error" => "Hanya Admin!"]);
        return response()->json($this->callPythonApi("/req_otp", ["msisdn" => $request->msisdn])); 
    }
    public function submitOtp(Request $request) { 
        if (!$this->isAdmin()) return response()->json(["success" => false, "error" => "Hanya Admin!"]);
        return response()->json($this->callPythonApi("/submit_otp", ["msisdn" => $request->msisdn, "otp" => $request->otp])); 
    }
    public function deleteSession(Request $request) { 
        if (!$this->isAdmin()) return response()->json(["success" => false, "error" => "Hanya Admin!"]);
        return response()->json($this->callPythonApi("/delete_session", ["msisdn" => $request->msisdn])); 
    }
    public function syncSession(Request $request) { 
        if (!$this->authorizeMsisdn($request->active_msisdn)) return response()->json(["success" => false, "error" => "Akses Ditolak!"]);
        return response()->json($this->callPythonApi("/sync_session", ["active_msisdn" => $request->active_msisdn])); 
    }
    public function inviteMember(Request $request) { 
        if (!$this->authorizeMsisdn($request->active_msisdn)) return response()->json(["success" => false, "error" => "Akses Ditolak!"]);
        return response()->json($this->callPythonApi("/akrab_change_member", $request->all(), 45)); 
    }
    public function removeMember(Request $request) { 
        if (!$this->authorizeMsisdn($request->active_msisdn)) return response()->json(["success" => false, "error" => "Akses Ditolak!"]);
        return response()->json($this->callPythonApi("/akrab_remove_member", $request->only(["active_msisdn", "family_member_id"]))); 
    }
    public function setQuota(Request $request) { 
        if (!$this->authorizeMsisdn($request->active_msisdn)) return response()->json(["success" => false, "error" => "Akses Ditolak!"]);
        // Konversi GB ke Byte untuk dikirim ke Python Engine
        $limit_bytes = floatval($request->limit_gb) * (1024 * 1024 * 1024);
        return response()->json($this->callPythonApi("/akrab_set_quota", ["active_msisdn" => $request->active_msisdn, "new_allocation" => $limit_bytes, "family_member_id" => $request->family_member_id])); 
    }
}
