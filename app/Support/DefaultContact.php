<?php

namespace App\Support;

class DefaultContact
{
    public static function phone(): string
    {
        return (string) config('tammer.contact.phone', '+965 18XXXXXX');
    }

    public static function address(): string
    {
        return (string) config('tammer.contact.address', 'العاصمة ، الكويت');
    }
}
