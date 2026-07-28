<?php

return [
    'models' => [
        'branch' => env('TAMMER_BRANCH_MODEL', 'App\\Modules\\Branches\\Models\\Branch'),
        'customer' => env('TAMMER_CUSTOMER_MODEL', 'App\\Modules\\Customers\\Models\\Customer'),
        'vehicle' => env('TAMMER_VEHICLE_MODEL', 'App\\Modules\\Vehicles\\Models\\Vehicle'),
    ],

    'queue' => [
        'average_service_minutes' => (int) env('TAMMER_QUEUE_AVG_MINUTES', 25),
    ],
];
