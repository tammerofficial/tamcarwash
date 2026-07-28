<?php

return [
    'attributes' => [
        'name' => 'الاسم',
        'phone' => 'رقم الجوال',
        'email' => 'البريد الإلكتروني',
        'plate_number' => 'رقم اللوحة',
        'branch_id' => 'الفرع',
        'customer_id' => 'العميل',
        'vehicle_id' => 'المركبة',
        'category_id' => 'التصنيف',
        'code' => 'الرمز',
        'city' => 'المدينة',
        'vehicle_type' => 'نوع المركبة',
        'rule_type' => 'نوع القاعدة',
        'base_price' => 'السعر الأساسي',
        'duration_minutes' => 'مدة الخدمة',
        'day_of_week' => 'يوم الأسبوع',
        'starts_at' => 'وقت البداية',
        'ends_at' => 'وقت النهاية',
        'points' => 'النقاط',
        'note' => 'الملاحظة',
    ],

    'required' => 'حقل :attribute مطلوب.',
    'unique' => 'قيمة :attribute مستخدمة مسبقاً.',
    'email' => 'يجب أن يكون :attribute بريداً إلكترونياً صالحاً.',
    'date' => 'يجب أن يكون :attribute تاريخاً صالحاً.',
    'integer' => 'يجب أن يكون :attribute رقماً صحيحاً.',
    'numeric' => 'يجب أن يكون :attribute رقماً.',
    'boolean' => 'يجب أن يكون :attribute صح أو خطأ.',
    'max' => [
        'string' => 'يجب ألا يتجاوز :attribute :max حرفاً.',
    ],
    'min' => [
        'numeric' => 'يجب أن يكون :attribute على الأقل :min.',
    ],
    'after' => 'يجب أن يكون :attribute بعد :date.',
    'after_or_equal' => 'يجب أن يكون :attribute في أو بعد :date.',
    'exists' => 'القيمة المحددة في :attribute غير موجودة.',
];
