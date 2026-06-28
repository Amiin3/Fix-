<?php
namespace App\Helpers;

class OneSignalHelper {
    public static function send($title, $message) {
        $app_id = "d285d368-7e50-48fd-a0cb-59c6b3bf3669";
        $rest_api_key = "os_v2_app_2kc5g2d6kbep3igllhdlhpzwnftqxgi2c37emen76xvrubcgxpvltbjns4akltu4ivu3j47w7u3oymh6vwmgfvqmvcffoqalh4osb7i";

        $fields = array(
            'app_id' => $app_id,
            // 'Total Subscriptions' adalah segmen default paling luas di OneSignal
            'included_segments' => array('Total Subscriptions'), 
            'headings' => array("en" => $title),
            'contents' => array("en" => $message),
            'url' => 'https://amifistore.web.id',
            'isAnyWeb' => true,
        );

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://onesignal.com/api/v1/notifications");
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Content-Type: application/json; charset=utf-8',
            'Authorization: Basic '.$rest_api_key
        ));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLOPT_POST, TRUE);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($fields));
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);

        $res = curl_exec($ch);
        curl_close($ch);
        return $res;
    }
}
