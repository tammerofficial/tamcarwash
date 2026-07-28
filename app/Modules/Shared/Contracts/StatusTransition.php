<?php

namespace App\Modules\Shared\Contracts;

interface StatusTransition
{
    public function canTransitionTo(string $status): bool;

    public function allowedTransitions(): array;
}
