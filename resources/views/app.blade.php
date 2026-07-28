<!DOCTYPE html>
<html lang="ar" dir="rtl">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'Tammer Wash') }}</title>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=ibm-plex-sans-arabic:400,500,600,700" rel="stylesheet" />

        @php
            $host = request()->getHost();
            $isLandlord = str_starts_with($host, 'admin.')
                || str_starts_with($host, 'platform.')
                || str_starts_with($host, 'landlord.');
        @endphp

        <script>
            window.__TAMMER__ = {
                appName: @json(config('app.name', 'Tammer Wash')),
                apiBaseUrl: @json(url('/api/v1')),
                landlordApiBaseUrl: @json(url('/api/landlord/v1')),
                sanctumUrl: @json(url('/sanctum/csrf-cookie')),
                csrfToken: @json(csrf_token()),
                isLandlord: @json($isLandlord),
                tenant: @json($tenant ?? null),
            };
        </script>

        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    </head>
    <body class="antialiased">
        <div id="app"></div>
    </body>
</html>
