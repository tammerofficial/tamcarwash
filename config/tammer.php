<?php

return [
    'contact' => [
        'phone' => env('TAMMER_DEFAULT_PHONE', '+965 18XXXXXX'),
        'address' => env('TAMMER_DEFAULT_ADDRESS', 'العاصمة ، الكويت'),
    ],

    'models' => [
        'branch' => env('TAMMER_BRANCH_MODEL', 'App\\Modules\\Branches\\Models\\Branch'),
        'customer' => env('TAMMER_CUSTOMER_MODEL', 'App\\Modules\\Customers\\Models\\Customer'),
        'vehicle' => env('TAMMER_VEHICLE_MODEL', 'App\\Modules\\Vehicles\\Models\\Vehicle'),
    ],

    'vat' => [
        'default_rate' => (float) env('TAMMER_VAT_RATE', 5),
        'country' => 'OM',
    ],

    'queue' => [
        'average_service_minutes' => (int) env('TAMMER_QUEUE_AVG_MINUTES', 25),
    ],

    'permissions' => [
        'dashboard.view',
        'branches.view', 'branches.manage',
        'customers.view', 'customers.manage',
        'vehicles.view', 'vehicles.manage',
        'services.view', 'services.manage',
        'pricing.view', 'pricing.manage',
        'bookings.view', 'bookings.manage',
        'queue.view', 'queue.manage',
        'orders.view', 'orders.manage',
        'invoices.view', 'invoices.manage',
        'payments.view', 'payments.manage',
        'expenses.view', 'expenses.manage',
        'reports.view',
        'settings.view', 'settings.manage',
        'users.view', 'users.manage',
    ],

    'roles' => [
        'owner' => ['*'],
        'manager' => [
            'dashboard.view',
            'branches.view', 'branches.manage',
            'customers.view', 'customers.manage',
            'vehicles.view', 'vehicles.manage',
            'services.view',
            'pricing.view',
            'bookings.view', 'bookings.manage',
            'queue.view', 'queue.manage',
            'orders.view', 'orders.manage',
            'invoices.view', 'invoices.manage',
            'payments.view',
            'reports.view',
            'settings.view',
        ],
        'cashier' => [
            'dashboard.view',
            'customers.view', 'customers.manage',
            'vehicles.view', 'vehicles.manage',
            'queue.view', 'queue.manage',
            'orders.view', 'orders.manage',
            'invoices.view', 'invoices.manage',
            'payments.view',
        ],
        'worker' => [
            'dashboard.view',
            'queue.view',
            'orders.view',
        ],
    ],
];
