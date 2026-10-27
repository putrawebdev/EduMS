<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Jadwal pemeriksaan tenggat tugas otomatis setiap jam dalam zona waktu Asia/Jakarta
Schedule::command('eduspace:check-deadlines')
    ->hourly()
    ->timezone('Asia/Jakarta')
    ->withoutOverlapping();
