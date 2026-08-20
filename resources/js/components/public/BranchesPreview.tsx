import { 
    MapPin, 
    Phone, 
    Clock, 
    ExternalLink,
    Navigation,
    CalendarDays
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function BranchesPreview() {
    const branches = [
        { 
            id: 1, 
            name: 'فرع المعبيلة', 
            address: 'المعبيلة الصناعية، مسقط، سلطنة عمان',
            phone: '+968 9000 0000',
            hours: '8:00 ص - 11:00 م',
            image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=800&auto=format&fit=crop'
        },
        { 
            id: 2, 
            name: 'فرع الخوير', 
            address: 'شارع الخدمات، الخوير، مسقط، سلطنة عمان',
            phone: '+968 9000 0001',
            hours: '24 ساعة',
            image: 'https://images.unsplash.com/photo-1605164597160-f560ad9101d3?q=80&w=800&auto=format&fit=crop'
        },
    ];

    return (
        <section className="py-32 bg-white relative overflow-hidden" dir="rtl">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                <div className="mb-20 text-center lg:text-start flex flex-col lg:flex-row items-end justify-between gap-10">
                    <div className="space-y-6 max-w-2xl">
                        <Badge className="bg-teal-50 text-teal-700 hover:bg-teal-100 border-none font-bold text-[10px] px-4 py-1 uppercase tracking-widest">
                            Our Network
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-bold text-[#004d4d]">
                            فروعنا في <span className="text-teal-600">مسقط</span>
                        </h2>
                        <p className="text-gray-500 text-lg opacity-80">
                            نحن متواجدون في أهم المواقع الحيوية لخدمتكم بشكل أسرع وأفضل عبر شبكة فروعنا المتكاملة.
                        </p>
                    </div>
                    <Button variant="outline" size="lg" className="rounded-xl font-bold border-teal-600/20 text-teal-700 hover:bg-teal-50 h-14 px-8">
                        استعراض كافة الفروع
                        <ExternalLink className="ms-2 h-4 w-4" />
                    </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                    {branches.map((branch) => (
                        <Card key={branch.id} className="group relative overflow-hidden rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 bg-white flex flex-col lg:flex-row transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">
                            <div className="lg:w-[45%] h-64 lg:h-auto overflow-hidden">
                                <img 
                                    src={branch.image} 
                                    alt={branch.name}
                                    className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-teal-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            <div className="lg:w-[55%] p-10 flex flex-col">
                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-teal-600 transition-colors">{branch.name}</h3>
                                    <p className="text-sm text-gray-500 flex items-start gap-3 leading-relaxed">
                                        <MapPin className="h-4 w-4 text-teal-600 shrink-0 mt-0.5 opacity-60" />
                                        {branch.address}
                                    </p>
                                </div>

                                <div className="space-y-4 mb-10">
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/50 border border-gray-100/50">
                                        <div className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-teal-600">
                                            <Phone className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-0.5">Contact</p>
                                            <p className="text-sm font-bold text-gray-900">{branch.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/50 border border-gray-100/50">
                                        <div className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-teal-600">
                                            <Clock className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-0.5">Opening Hours</p>
                                            <p className="text-sm font-bold text-gray-900">{branch.hours}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto flex items-center gap-4">
                                    <Button className="flex-1 h-14 rounded-xl font-bold bg-teal-600 shadow-lg shadow-teal-900/10 transition-all active:scale-[0.98]">
                                        <Navigation className="me-2 h-4 w-4" />
                                        الاتجاهات
                                    </Button>
                                    <Button variant="outline" size="icon" className="h-14 w-14 rounded-xl border-gray-100 text-gray-400 hover:text-teal-600 hover:border-teal-600 hover:bg-teal-50 transition-all shadow-sm">
                                        <CalendarDays className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
