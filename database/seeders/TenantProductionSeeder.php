<?php

namespace Database\Seeders;

class TenantProductionSeeder extends IdempotentSeeder
{
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            OmanVatSeeder::class,
            WashServicesSeeder::class,
            VehicleTypesSeeder::class,
            InvoiceSettingsSeeder::class,
            QueueSettingsSeeder::class,
        ]);
    }
}
