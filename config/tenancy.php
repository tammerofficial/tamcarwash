<?php

return [

    'database' => [
        'landlord_driver' => env('LANDLORD_DB_DRIVER', 'mysql'),
        'tenant_driver' => env('TENANT_DB_DRIVER', env('LANDLORD_DB_DRIVER', 'mysql')),
        'tenant_sqlite_directory' => env('TENANT_SQLITE_DIRECTORY') ?: database_path('tenants'),
    ],

    'landlord_connection' => env('LANDLORD_DB_CONNECTION', 'landlord'),

    'tenant_connection' => env('TENANT_DB_CONNECTION', 'tenant'),

    'central_domains' => array_filter(array_map(
        'trim',
        explode(',', env('TENANCY_CENTRAL_DOMAINS', 'localhost,127.0.0.1,tamcarwash.test,tamcarwash.on-forge.com'))
    )),

    'platform_domain' => env('PLATFORM_DOMAIN', env('TENANCY_PLATFORM_DOMAIN', 'tamcarwash.test')),

    'subdirectory_enabled' => filter_var(env('TENANCY_SUBDIRECTORY_ENABLED', true), FILTER_VALIDATE_BOOL),

    'reserved_paths' => array_values(array_unique(array_filter(array_map(
        'strtolower',
        array_map('trim', explode(',', env('TENANCY_RESERVED_PATHS', 'api,login,register,sanctum,up,landlord,build,storage,dashboard')))
    )))),

    'local_default_tenant_slug' => env('TENANCY_LOCAL_DEFAULT_TENANT_SLUG', 'demo'),

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
