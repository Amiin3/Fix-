<?php
namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AkrabApiService
{
    protected $baseUrl;
    protected $apiKey;

    public function __construct()
    {
        $this->baseUrl = 'http://138.197.120.9:8888/api/v1';
        $this->apiKey = 'MILA-3C786421C13DA79AE041'; 
    }

    public function requestOtp($msisdn) { return $this->sendRequest('/req_otp', ['msisdn' => $msisdn]); }
    public function submitOtp($msisdn, $otp) { return $this->sendRequest('/submit_otp', ['msisdn' => $msisdn, 'otp' => $otp]); }
    public function listSessions() { return $this->sendRequest('/list_sessions'); }
    public function deleteManager($msisdn) { return $this->sendRequest('/delete_manager', ['msisdn' => $msisdn]); }
    public function getMemberInfo($activeMsisdn) { return $this->sendRequest('/member_info', ['active_msisdn' => $activeMsisdn]); }
    
    public function inviteMember($activeMsisdn, $slotId, $familyMemberId, $targetMsisdn) {
        return $this->sendRequest('/invite_member', ['active_msisdn' => $activeMsisdn, 'slot_id' => $slotId, 'family_member_id' => $familyMemberId, 'msisdn' => $targetMsisdn]);
    }
    
    public function kickMember($activeMsisdn, $familyMemberId) {
        return $this->sendRequest('/kick_member', ['active_msisdn' => $activeMsisdn, 'family_member_id' => $familyMemberId]);
    }

    public function setQuota($activeMsisdn, $familyMemberId, $gb, $originalAllocation) {
        return $this->sendRequest('/set_quota', ['active_msisdn' => $activeMsisdn, 'family_member_id' => $familyMemberId, 'gb' => $gb, 'original_allocation' => $originalAllocation]);
    }

    private function sendRequest($endpoint, $params = [])
    {
        $params['api_key'] = $this->apiKey;
        try {
            $response = Http::timeout(20)->get($this->baseUrl . $endpoint, $params);
            $raw = $response->json();
            
            if ($endpoint === '/member_info' && isset($raw['data']['data']['members'])) {
                $cleanMembers = $raw['data']['data']['members'] ?? [];
                if (isset($raw['data']['data']['additional_members'])) {
                    $cleanMembers = array_merge($cleanMembers, $raw['data']['data']['additional_members']);
                }
                return [
                    'status' => true,
                    'data' => [
                        'members' => array_map(function($m) {
                            return [
                                'slot_id' => $m['slot_id'] ?? rand(1000,9999),
                                'msisdn' => $m['msisdn'] ?? null,
                                'family_member_id' => $m['family_member_id'] ?? null,
                                'quota_limit' => isset($m['usage']['quota_allocated']) ? (($m['usage']['quota_allocated'] / 1073741824) . ' GB') : '0 GB'
                            ];
                        }, $cleanMembers)
                    ]
                ];
            }

            if (isset($raw['success'])) { $raw['status'] = $raw['success']; }
            if (isset($raw['error']) && !isset($raw['message'])) { $raw['message'] = $raw['error']; }
            
            return $raw;
        } catch (\Exception $e) {
            Log::error("[MILA STORE SERVICE ERROR] {$endpoint} | Msg: " . $e->getMessage());
            return ['status' => false, 'message' => 'Gagal koneksi ke server pusat.'];
        }
    }
}
