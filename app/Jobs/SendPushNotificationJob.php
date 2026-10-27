<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\WebPushService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendPushNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 10;

    public function __construct(
        public int $userId,
        public string $title,
        public string $body,
        public ?string $url = null,
        public string $type = 'general',
        public ?string $idempotencyKey = null
    ) {}

    public function handle(WebPushService $webPushService): void
    {
        $user = User::find($this->userId);
        if (! $user) {
            return;
        }

        $pref = $user->notificationPreference;
        if ($pref && ! $pref->web_push) {
            Log::info("User #{$user->id} has disabled Web Push notifications.");
            return;
        }

        $webPushService->sendToUser(
            $user,
            $this->title,
            $this->body,
            $this->url,
            $this->type,
            $this->idempotencyKey
        );
    }
}

