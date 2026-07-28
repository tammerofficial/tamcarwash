<?php

namespace App\Modules\Customers\Services;

use App\Modules\Customers\Enums\CustomerStatus;
use App\Modules\Customers\Enums\LoyaltyPointType;
use App\Modules\Customers\Models\Customer;
use App\Modules\Customers\Models\CustomerNote;
use App\Modules\Customers\Models\LoyaltyPoint;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class CustomerService
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Customer
    {
        return Customer::query()->create([
            'name' => $data['name'],
            'phone' => $data['phone'],
            'email' => $data['email'] ?? null,
            'status' => $data['status'] ?? CustomerStatus::Active,
            'company_id' => $data['company_id'] ?? null,
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Customer $customer, array $data): Customer
    {
        $customer->update(collect($data)->only([
            'name', 'phone', 'email', 'status', 'company_id',
        ])->filter(fn ($v) => $v !== null)->all());

        return $customer->fresh(['company', 'notes']);
    }

    public function blacklist(Customer $customer, ?string $reason = null): Customer
    {
        $customer->update([
            'status' => CustomerStatus::Blacklisted,
            'blacklisted_at' => now(),
            'blacklist_reason' => $reason,
        ]);

        return $customer->fresh();
    }

    public function activate(Customer $customer): Customer
    {
        $customer->update([
            'status' => CustomerStatus::Active,
            'blacklisted_at' => null,
            'blacklist_reason' => null,
        ]);

        return $customer->fresh();
    }

    public function deactivate(Customer $customer): Customer
    {
        $customer->update(['status' => CustomerStatus::Inactive]);

        return $customer->fresh();
    }

    public function addNote(Customer $customer, array $data, ?int $userId = null): CustomerNote
    {
        return $customer->notes()->create([
            'user_id' => $userId,
            'note' => $data['note'],
            'is_pinned' => $data['is_pinned'] ?? false,
        ]);
    }

    public function adjustLoyaltyPoints(
        Customer $customer,
        int $points,
        LoyaltyPointType $type,
        ?string $description = null,
        ?string $referenceType = null,
        ?int $referenceId = null,
    ): LoyaltyPoint {
        if ($type === LoyaltyPointType::Redeem && $points > 0) {
            $points = -abs($points);
        }

        if ($type === LoyaltyPointType::Earn && $points < 0) {
            throw new InvalidArgumentException('نقاط الاكتساب يجب أن تكون موجبة.');
        }

        if ($type === LoyaltyPointType::Redeem && abs($points) > $customer->loyalty_points_balance) {
            throw new InvalidArgumentException('رصيد النقاط غير كافٍ.');
        }

        return DB::transaction(function () use ($customer, $points, $type, $description, $referenceType, $referenceId) {
            return LoyaltyPoint::query()->create([
                'customer_id' => $customer->id,
                'points' => $points,
                'type' => $type,
                'description' => $description,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
            ]);
        });
    }
}
