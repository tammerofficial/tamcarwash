<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Support\Controllers\FaqController;
use App\Modules\Support\Controllers\SupportTicketController;
use App\Modules\Support\Controllers\AnnouncementController;

Route::middleware(['api'])->group(function () {
    // FAQ Routes (Public)
    Route::prefix('faqs')->group(function () {
        Route::get('/', [FaqController::class, 'index']);
        Route::get('/{faq}', [FaqController::class, 'show']);
        Route::get('/category/{category}', [FaqController::class, 'byCategory']);
        Route::post('/{faq}/helpful', [FaqController::class, 'markHelpful']);
        Route::post('/{faq}/not-helpful', [FaqController::class, 'markNotHelpful']);
        Route::get('/meta/categories', [FaqController::class, 'categories']);
        Route::get('/meta/popular', [FaqController::class, 'popular']);
        Route::get('/meta/most-helpful', [FaqController::class, 'mostHelpful']);
        Route::get('/meta/statistics', [FaqController::class, 'statistics']);
    });

    // Support Ticket Routes (Requires Auth)
    Route::middleware(['auth:sanctum'])->prefix('support-tickets')->group(function () {
        Route::get('/', [SupportTicketController::class, 'index']);
        Route::post('/', [SupportTicketController::class, 'create']);
        Route::get('/{ticket}', [SupportTicketController::class, 'show']);
        Route::put('/{ticket}', [SupportTicketController::class, 'update']);
        Route::post('/{ticket}/resolve', [SupportTicketController::class, 'resolve']);
        Route::post('/{ticket}/close', [SupportTicketController::class, 'close']);
        Route::get('/user/my-tickets', [SupportTicketController::class, 'myTickets']);
        Route::get('/meta/statistics', [SupportTicketController::class, 'statistics']);
    });

    // Announcement Routes (Public)
    Route::prefix('announcements')->group(function () {
        Route::get('/', [AnnouncementController::class, 'index']);
        Route::get('/latest', [AnnouncementController::class, 'latest']);
        Route::get('/by-role/{role}', [AnnouncementController::class, 'byRole']);
        Route::get('/by-type/{type}', [AnnouncementController::class, 'byType']);
        Route::get('/{announcement}', [AnnouncementController::class, 'show']);
        Route::get('/meta/types', [AnnouncementController::class, 'types']);
        Route::get('/meta/priorities', [AnnouncementController::class, 'priorities']);
        Route::get('/meta/roles', [AnnouncementController::class, 'roles']);
        Route::get('/meta/statistics', [AnnouncementController::class, 'statistics']);
    });
});
