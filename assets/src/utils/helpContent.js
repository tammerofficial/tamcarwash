/**
 * Help Content Utilities
 * Centralized help content for all pages
 */

export const helpContent = {
  // Getting Started
  'getting-started': {
    title: {
      ar: 'دليل البدء السريع',
      en: 'Quick Start Guide',
    },
    description: {
      ar: 'ابدأ استخدام تمر واش في 5 دقائق',
      en: 'Get started with Tammer Wash in 5 minutes',
    },
    icon: 'cil-rocket',
    sections: [
      {
        title: {
          ar: 'إنشاء الحساب',
          en: 'Create Account',
        },
        content: {
          ar: 'أنشئ حسابك باستخدام البريد الإلكتروني وكلمة مرور قوية',
          en: 'Create your account with email and strong password',
        },
      },
      {
        title: {
          ar: 'إضافة الخدمات',
          en: 'Add Services',
        },
        content: {
          ar: 'أضف الخدمات التي يقدمها مغسلك (غسيل، تلميع، إلخ)',
          en: 'Add services your car wash offers (wash, polish, etc.)',
        },
      },
      {
        title: {
          ar: 'إضافة الموظفين',
          en: 'Add Staff',
        },
        content: {
          ar: 'أضف فريقك وحدد مهاراتهم والخدمات التي يقدمونها',
          en: 'Add your team and assign their skills and services',
        },
      },
      {
        title: {
          ar: 'إنشاء الحجوزات',
          en: 'Create Bookings',
        },
        content: {
          ar: 'ابدأ في إضافة حجوزات العملاء',
          en: 'Start adding customer bookings',
        },
      },
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    learnMoreUrl: '/docs/GETTING_STARTED.md',
  },

  // Dashboard
  dashboard: {
    title: {
      ar: 'لوحة التحكم',
      en: 'Dashboard',
    },
    description: {
      ar: 'نظرة عامة على أداء مغسلك',
      en: 'Overview of your car wash performance',
    },
    icon: 'cil-dashboard',
    tips: [
      {
        title: {
          ar: 'الإحصائيات اليومية',
          en: 'Daily Statistics',
        },
        content: {
          ar: 'عرض عدد الحجوزات والدخل لهذا اليوم',
          en: 'See today\'s bookings and income',
        },
      },
      {
        title: {
          ar: 'أداء الموظفين',
          en: 'Staff Performance',
        },
        content: {
          ar: 'تابع أداء كل موظف في الوقت الفعلي',
          en: 'Track each staff member\'s performance in real-time',
        },
      },
      {
        title: {
          ar: 'الحجوزات المتبقية',
          en: 'Pending Bookings',
        },
        content: {
          ar: 'عرض الحجوزات التي لم تُنجز بعد',
          en: 'See bookings that are still pending',
        },
      },
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    learnMoreUrl: '/docs/FEATURES.md',
  },

  // Bookings
  bookings: {
    title: {
      ar: 'إدارة الحجوزات',
      en: 'Booking Management',
    },
    description: {
      ar: 'تنظيم وتتبع جميع حجوزات العملاء',
      en: 'Organize and track all customer bookings',
    },
    icon: 'cil-calendar',
    tips: [
      {
        title: {
          ar: 'إضافة حجز جديد',
          en: 'Add New Booking',
        },
        content: {
          ar: 'اختر العميل والخدمة والموظف والوقت',
          en: 'Choose customer, service, staff, and time',
        },
      },
      {
        title: {
          ar: 'حجوزات دورية',
          en: 'Recurring Bookings',
        },
        content: {
          ar: 'أنشئ حجوزات تتكرر كل أسبوع أو شهر',
          en: 'Create bookings that repeat weekly or monthly',
        },
      },
      {
        title: {
          ar: 'تحديث الحالة',
          en: 'Update Status',
        },
        content: {
          ar: 'حدّث حالة الحجز من جديد إلى مكتمل',
          en: 'Update booking status from new to completed',
        },
      },
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    learnMoreUrl: '/docs/FEATURES.md#إدارة-الحجوزات',
  },

  // Staff
  staff: {
    title: {
      ar: 'إدارة الموظفين',
      en: 'Staff Management',
    },
    description: {
      ar: 'إدارة فريقك والرواتب والحضور',
      en: 'Manage your team, salaries, and attendance',
    },
    icon: 'cil-people',
    tips: [
      {
        title: {
          ar: 'إضافة موظف',
          en: 'Add Staff Member',
        },
        content: {
          ar: 'أضف اسم الموظف والراتب والمهارات',
          en: 'Add staff name, salary, and skills',
        },
      },
      {
        title: {
          ar: 'الراتب والعمولات',
          en: 'Salary & Commissions',
        },
        content: {
          ar: 'احسب الراتب مع العمولات تلقائياً',
          en: 'Auto-calculate salary with commissions',
        },
      },
      {
        title: {
          ar: 'الحضور والغياب',
          en: 'Attendance',
        },
        content: {
          ar: 'تابع حضور الموظفين والإجازات',
          en: 'Track attendance and leave',
        },
      },
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    learnMoreUrl: '/docs/FEATURES.md#إدارة-الموظفين',
  },

  // Services
  services: {
    title: {
      ar: 'إدارة الخدمات',
      en: 'Service Management',
    },
    description: {
      ar: 'إدارة الخدمات والأسعار والمدة الزمنية',
      en: 'Manage services, prices, and duration',
    },
    icon: 'cil-briefcase',
    tips: [
      {
        title: {
          ar: 'إضافة خدمة جديدة',
          en: 'Add New Service',
        },
        content: {
          ar: 'أضف اسم الخدمة والسعر والمدة',
          en: 'Add service name, price, and duration',
        },
      },
      {
        title: {
          ar: 'تحديث الأسعار',
          en: 'Update Prices',
        },
        content: {
          ar: 'غيّر أسعار الخدمات حسب السوق',
          en: 'Adjust service prices according to market',
        },
      },
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    learnMoreUrl: '/docs/FEATURES.md#الخدمات',
  },

  // Reports
  reports: {
    title: {
      ar: 'التقارير والإحصائيات',
      en: 'Reports & Analytics',
    },
    description: {
      ar: 'تحليل أداء مغسلك والدخل والموظفين',
      en: 'Analyze your car wash performance, income, and staff',
    },
    icon: 'cil-chart-line',
    tips: [
      {
        title: {
          ar: 'تقرير الدخل',
          en: 'Income Report',
        },
        content: {
          ar: 'عرض الدخل اليومي والأسبوعي والشهري',
          en: 'View daily, weekly, and monthly income',
        },
      },
      {
        title: {
          ar: 'أداء الموظفين',
          en: 'Staff Performance',
        },
        content: {
          ar: 'قارن أداء الموظفين وحدد الأفضل',
          en: 'Compare staff performance and identify top performers',
        },
      },
      {
        title: {
          ar: 'تصدير التقارير',
          en: 'Export Reports',
        },
        content: {
          ar: 'صدّر التقارير بصيغة Excel أو PDF',
          en: 'Export reports as Excel or PDF',
        },
      },
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    learnMoreUrl: '/docs/FEATURES.md#التقارير-والإحصائيات',
  },

  // Customers
  customers: {
    title: {
      ar: 'إدارة العملاء',
      en: 'Customer Management',
    },
    description: {
      ar: 'تتبع بيانات العملاء والحجوزات السابقة',
      en: 'Track customer data and booking history',
    },
    icon: 'cil-user',
    tips: [
      {
        title: {
          ar: 'إضافة عميل',
          en: 'Add Customer',
        },
        content: {
          ar: 'أضف معلومات العميل الأساسية',
          en: 'Add customer basic information',
        },
      },
      {
        title: {
          ar: 'سجل العميل',
          en: 'Customer History',
        },
        content: {
          ar: 'عرض جميع حجوزات العميل السابقة',
          en: 'View all customer\'s previous bookings',
        },
      },
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    learnMoreUrl: '/docs/FEATURES.md#إدارة-العملاء',
  },

  // Invoices
  invoices: {
    title: {
      ar: 'الفواتير والدفع',
      en: 'Invoicing & Payments',
    },
    description: {
      ar: 'إنشاء وإدارة الفواتير والدفع',
      en: 'Create and manage invoices and payments',
    },
    icon: 'cil-file',
    tips: [
      {
        title: {
          ar: 'فاتورة جديدة',
          en: 'New Invoice',
        },
        content: {
          ar: 'أنشئ فاتورة للعميل بالخدمات المقدمة',
          en: 'Create invoice for customer services',
        },
      },
      {
        title: {
          ar: 'فواتير دورية',
          en: 'Recurring Invoices',
        },
        content: {
          ar: 'أنشئ فواتير تتكرر تلقائياً',
          en: 'Create auto-recurring invoices',
        },
      },
      {
        title: {
          ar: 'طرق الدفع',
          en: 'Payment Methods',
        },
        content: {
          ar: 'اختر من النقد والبطاقة والتحويل البنكي',
          en: 'Choose from cash, card, or bank transfer',
        },
      },
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    learnMoreUrl: '/docs/FEATURES.md#الفواتير-والدفع',
  },

  // Branches
  branches: {
    title: {
      ar: 'إدارة الفروع',
      en: 'Branch Management',
    },
    description: {
      ar: 'إدارة فروع متعددة من حساب واحد',
      en: 'Manage multiple branches from one account',
    },
    icon: 'cil-building',
    tips: [
      {
        title: {
          ar: 'إضافة فرع',
          en: 'Add Branch',
        },
        content: {
          ar: 'أضف فرع جديد باسم وموقع مختلف',
          en: 'Add new branch with different name and location',
        },
      },
      {
        title: {
          ar: 'مقارنة الفروع',
          en: 'Compare Branches',
        },
        content: {
          ar: 'قارن أداء الفروع المختلفة',
          en: 'Compare different branches performance',
        },
      },
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    learnMoreUrl: '/docs/FEATURES.md#الفروع',
  },

  // Settings
  settings: {
    title: {
      ar: 'الإعدادات',
      en: 'Settings',
    },
    description: {
      ar: 'إعدادات المغسل والحساب الشخصي',
      en: 'Car wash and personal account settings',
    },
    icon: 'cil-settings',
    tips: [
      {
        title: {
          ar: 'البيانات الأساسية',
          en: 'Basic Information',
        },
        content: {
          ar: 'تحديث بيانات المغسل والعنوان',
          en: 'Update car wash info and address',
        },
      },
      {
        title: {
          ar: 'ساعات العمل',
          en: 'Working Hours',
        },
        content: {
          ar: 'حدد ساعات العمل اليومية',
          en: 'Set daily working hours',
        },
      },
      {
        title: {
          ar: 'الإشعارات',
          en: 'Notifications',
        },
        content: {
          ar: 'اختر الإشعارات التي تريد استلامها',
          en: 'Choose which notifications you want',
        },
      },
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    learnMoreUrl: '/docs/FEATURES.md#الإعدادات',
  },
};

/**
 * Video tutorials
 */
export const videoTutorials = [
  {
    id: 'setup',
    title: { ar: 'إعداد المغسل', en: 'Setup Your Car Wash' },
    description: { ar: 'خطوات إعداد الحساب والبيانات الأساسية', en: 'Setup account and basic information' },
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '3:45',
    category: 'getting-started',
  },
  {
    id: 'services',
    title: { ar: 'إضافة الخدمات', en: 'Add Services' },
    description: { ar: 'كيفية إضافة خدمات المغسل', en: 'How to add car wash services' },
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '2:15',
    category: 'services',
  },
  {
    id: 'staff',
    title: { ar: 'إدارة الموظفين', en: 'Manage Staff' },
    description: { ar: 'كيفية إضافة الموظفين وتعيين الحجوزات', en: 'How to add staff and assign bookings' },
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '4:30',
    category: 'staff',
  },
  {
    id: 'bookings',
    title: { ar: 'إنشاء الحجوزات', en: 'Create Bookings' },
    description: { ar: 'كيفية إضافة وإدارة الحجوزات', en: 'How to create and manage bookings' },
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '3:20',
    category: 'bookings',
  },
  {
    id: 'reports',
    title: { ar: 'عرض التقارير', en: 'View Reports' },
    description: { ar: 'كيفية عرض وتصدير التقارير', en: 'How to view and export reports' },
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '2:50',
    category: 'reports',
  },
  {
    id: 'invoices',
    title: { ar: 'إنشاء الفواتير', en: 'Create Invoices' },
    description: { ar: 'كيفية إنشاء وإرسال الفواتير', en: 'How to create and send invoices' },
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '2:40',
    category: 'invoices',
  },
];

/**
 * Get help content by page
 */
export function getPageHelp(pageKey) {
  return helpContent[pageKey] || null;
}

/**
 * Get videos by category
 */
export function getVideosByCategory(category) {
  return videoTutorials.filter(video => video.category === category);
}

/**
 * Search help content
 */
export function searchHelp(query) {
  const results = [];
  
  Object.entries(helpContent).forEach(([key, content]) => {
    const titleMatch = content.title.ar.includes(query) || content.title.en.includes(query);
    const descMatch = content.description.ar.includes(query) || content.description.en.includes(query);
    
    if (titleMatch || descMatch) {
      results.push({ key, ...content });
    }
  });
  
  return results;
}

export default {
  helpContent,
  videoTutorials,
  getPageHelp,
  getVideosByCategory,
  searchHelp,
};
