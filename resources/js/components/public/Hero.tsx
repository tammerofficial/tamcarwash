import { Link } from 'react-router-dom';
import { 
    Star, 
    Droplets, 
    ShieldCheck, 
    Sparkles,
    ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function PublicHero() {
    return (
        <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-brand-primary" dir="rtl">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-secondary-10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-[0.03] bg-center" />

            <div className="relative mx-auto max-w-7xl px-4 lg:px-8 w-full py-20 lg:py-32">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-10 text-center lg:text-start max-w-2xl mx-auto lg:mx-0">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                            <Badge className="bg-brand-secondary text-white hover:opacity-90 border-none font-bold text-[10px] px-2 py-0.5 uppercase tracking-wider">NEW</Badge>
                            <span className="text-white/70 text-xs font-medium tracking-wide">الآن خدمة التلميع السيراميكي متاحة في جميع الفروع</span>
                        </div>
                        
                        <div className="space-y-6">
                            <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.15]">
                                تجربة العناية <br />
                                <span className="text-brand-secondary">بسيارتك كما لم تعهدها</span>
                            </h1>
                            
                            <p className="text-lg text-white/60 leading-relaxed max-w-xl mx-auto lg:mx-0">
                                نجمع بين التكنولوجيا الألمانية والخبرة العمانية لنقدم لسيارتك أفضل حماية ولمعان يدوم طويلاً.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-5">
                            <Button size="lg" asChild className="h-14 px-10 rounded-xl text-lg font-bold bg-brand-secondary text-white hover:opacity-90 shadow-xl w-full sm:w-auto transition-all">
                                <Link to="/book">
                                    احجز موعدك الآن
                                </Link>
                            </Button>

                            <Button variant="outline" size="lg" asChild className="h-14 px-8 rounded-xl text-lg font-bold border-white/20 bg-white/5 text-white hover:bg-white/10 w-full sm:w-auto backdrop-blur-sm transition-all">
                                <Link to="/track">
                                    تتبع طلبي
                                </Link>
                            </Button>
                        </div>

                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm">
                            <Link to="/queue" className="text-white/70 hover:text-brand-secondary transition-colors font-medium">
                                حالة الطابور المباشرة ←
                            </Link>
                        </div>

                        <div className="pt-10 flex flex-wrap items-center justify-center lg:justify-start gap-10 opacity-70">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-1">
                                    {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-brand-secondary text-brand-secondary" />)}
                                </div>
                                <p className="text-white font-medium text-xs tracking-wide">أكثر من 50,000 عميل سعيد</p>
                            </div>
                            <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
                            <div className="flex items-center gap-4">
                                <ShieldCheck className="h-5 w-5 text-brand-secondary" />
                                <span className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">Quality Guaranteed</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative lg:block">
                        <div className="relative z-10 overflow-hidden rounded-[2rem] border border-white/10 shadow-3xl bg-brand-primary-20">
                            <img 
                                src="/images/wash/hero-car-wash.jpg" 
                                alt="Premium Car Wash" 
                                className="w-full aspect-[4/5] object-cover opacity-90"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=1000&auto=format&fit=crop';
                                }}
                            />
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-primary)] via-transparent to-transparent opacity-60" />
                            
                            <div className="absolute bottom-10 right-10 left-10 p-8 rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl border border-white/20">
                                <div className="flex items-center gap-5">
                                    <div className="h-14 w-14 rounded-xl bg-brand-secondary flex items-center justify-center text-white shrink-0 shadow-lg">
                                        <Sparkles className="h-7 w-7" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-gray-900 font-bold text-lg mb-0.5">تلميع نانو سيراميك</p>
                                        <p className="text-brand-secondary text-[10px] font-black uppercase tracking-[0.15em]">Starts from 45 OMR</p>
                                    </div>
                                    <Button size="icon" variant="ghost" className="rounded-lg bg-brand-secondary-10 text-brand-secondary hover:bg-brand-secondary-20">
                                        <ArrowLeft className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -top-6 -right-6 h-20 w-20 rounded-2xl bg-brand-secondary shadow-2xl flex items-center justify-center text-white z-20">
                            <Droplets className="h-10 w-10" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
