<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PoNotification extends Notification
{
    use Queueable;

    public $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'title' => $this->data['title'] ?? 'Pemberitahuan',
            'message' => $this->data['message'] ?? '',
            'type' => $this->data['type'] ?? 'info',
            'icon' => $this->data['icon'] ?? 'fa-bell',
            'time' => now()->toDateTimeString(),
        ];
    }
}
