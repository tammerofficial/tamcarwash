<?php

return [

    'landlord_connection' => env('LANDLORD_DB_CONNECTION', 'landlord'),

    'tenant_connection' => env('TENANT_DB_CONNECTION', 'tenant'),

    'central_domains' => array_filter(explode(',', env('TENANCY_CENTRAL_DOMAINS', 'localhost,127.0.0.1,tamcarwash.test'))),

    'platform_domain' => env('TENANCY_PLATFORM_DOMAIN', 'tamcarwash.test'),

    'tenant_database_prefix' => env('TENANT_DB_PREFIX', 'tamcarwash_tenant_'),

    'tenant_migrations_path' => database_path('migrations/tenant'),

    'tenant_seeders_namespace' => 'Database\\Seeders\\Tenant\\',

    'cache' => [
        'store' => env('TENANT_CACHE_STORE', env('CACHE_STORE', 'redis')),
        'prefix' => env('TENANT_CACHE_PREFIX', 'tenant:'),
        'ttl' => (int) env('TENANT_CACHE_TTL', 3600),
    ],

    'provisioning' => [
        'steps' => [
            'validate_tenant',
            'create_database',
            'register_database',
            'run_migrations',
            'seed_tenant',
            'configure_domains',
            'activate_tenant',
            'finalize',
        ],
    ],

    'health_check' => [
        'timeout' => (int) env('TENANT_HEALTH_TIMEOUT', 5),
    ],

];
