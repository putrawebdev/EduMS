<?php

namespace App\Services;

use App\Models\NotificationDeliveryLog;
use App\Models\PushSubscription;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;

class WebPushService
{
    protected ?WebPush $webPush = null;

    public function __construct()
    {
        $subject = config('services.webpush.vapid_subject') ?: env('VAPID_SUBJECT', 'mailto:admin@eduspace.test');
        $publicKey = config('services.webpush.public_key') ?: env('VAPID_PUBLIC_KEY');
        $privateKey = config('services.webpush.private_key') ?: env('VAPID_PRIVATE_KEY');

        if ($publicKey && $privateKey) {
            try {
                $auth = [
                    'VAPID' => [
                        'subject' => $subject,
                        'publicKey' => $publicKey,
                        'privateKey' => $privateKey,
                    ],
                ];
                $this->webPush = new WebPush($auth);
                $this->webPush->setAutomaticPadding(false);
            } catch (Exception $e) {
                Log::error('WebPush initialization error: ' . $e->getMessage());
            }
        }
    }

    /**
     * Send Web Push to a user's registered devices.
     */
    public function sendToUser(User $user, string $title, string $body, ?string $url = null, string $type = 'general', ?string $idempotencyKey = null): array
    {
        if ($idempotencyKey) {
            $alreadySent = NotificationDeliveryLog::where('idempotency_key', $idempotencyKey)
                ->where('status', 'sent')
                ->exists();

            if ($alreadySent) {
                Log::info("WebPush skipped due to duplicate idempotency key: {$idempotencyKey}");
                return ['status' => 'skipped', 'reason' => 'duplicate_idempotency_key'];
            }
        }

        if (! $this->webPush) {
            Log::warning('WebPush is not configured with VAPID keys.');
            $this->logDelivery($user->id, $type, 'web_push', 'failed', $idempotencyKey, 'VAPID keys not configured');
            return ['status' => 'failed', 'reason' => 'not_configured'];
        }

        $subscriptions = $user->pushSubscriptions()->get();
        if ($subscriptions->isEmpty()) {
            return ['status' => 'skipped', 'reason' => 'no_subscriptions'];
        }

        $payload = json_encode([
            'title' => $title,
            'body' => $body,
            'icon' => '/icons/icon-192x192.png',
            'badge' => '/icons/badge-72x72.png',
            'data' => [
                'url' => $url ?: '/dashboard',
                'type' => $type,
            ],
        ]);

        $results = [];

        foreach ($subscriptions as $sub) {
            try {
                $webPushSubscription = Subscription::create([
                    'endpoint' => $sub->endpoint,
                    'publicKey' => $sub->public_key,
                    'authToken' => $sub->auth_token,
                    'contentEncoding' => $sub->content_encoding ?: 'aesgcm',
                ]);

                $report = $this->webPush->sendOneNotification($webPushSubscription, $payload);

                if ($report->isSuccess()) {
                    $results[] = ['endpoint' => $sub->endpoint, 'success' => true];
                    $this->logDelivery($user->id, $type, 'web_push', 'sent', $idempotencyKey, null, ['title' => $title]);
                } else {
                    $errorReason = $report->getReason();
                    $statusCode = $report->getResponse() ? $report->getResponse()->getStatusCode() : null;
                    $results[] = ['endpoint' => $sub->endpoint, 'success' => false, 'reason' => $errorReason];

                    // Remove invalid / expired subscription (404, 410)
                    if ($statusCode === 404 || $statusCode === 410 || $report->isSubscriptionExpired()) {
                        Log::info("Removing expired push subscription for user #{$user->id}");
                        $sub->delete();
                    }

                    $this->logDelivery($user->id, $type, 'web_push', 'failed', $idempotencyKey, $errorReason);
                }
            } catch (Exception $e) {
                Log::error('Error sending push notification: ' . $e->getMessage());
                $results[] = ['endpoint' => $sub->endpoint, 'success' => false, 'error' => $e->getMessage()];
                $this->logDelivery($user->id, $type, 'web_push', 'failed', $idempotencyKey, $e->getMessage());
            }
        }

        return ['status' => 'processed', 'results' => $results];
    }

    protected function logDelivery(?int $userId, string $type, string $channel, string $status, ?string $idempotencyKey = null, ?string $errorMessage = null, ?array $payload = null): void
    {
        try {
            NotificationDeliveryLog::create([
                'user_id' => $userId,
                'notification_type' => $type,
                'channel' => $channel,
                'status' => $status,
                'idempotency_key' => $idempotencyKey,
                'error_message' => $errorMessage,
                'payload' => $payload,
            ]);
        } catch (Exception $e) {
            Log::error('Failed to write notification delivery log: ' . $e->getMessage());
        }
    }
}

