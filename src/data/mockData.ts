
import { Craftsman, Job, CategoryType, GovernorateType } from '../types';

export const CATEGORIES: CategoryType[] = [
  { id: 'plumber', name: 'سباك', icon: 'wrench' },
  { id: 'electrician', name: 'كهربائي', icon: 'bolt' },
  { id: 'painter', name: 'نقاش', icon: 'edit' },
  { id: 'carpenter', name: 'نجار', icon: 'wrench' },
  { id: 'tiler', name: 'مبلط', icon: 'settings' },
  { id: 'ac_technician', name: 'فني تكييف', icon: 'settings' },
  { id: 'satellite', name: 'فني دش', icon: 'settings' },
  { id: 'gypsum', name: 'فني جبس', icon: 'settings' },
];

export const GOVERNORATES: GovernorateType[] = [
  {
    id: 'cairo',
    name: 'القاهرة',
    cities: ['مدينة نصر', 'المعادي', 'مصر الجديدة', 'القاهرة الجديدة', 'العبور']
  },
  {
    id: 'giza',
    name: 'الجيزة',
    cities: ['6 أكتوبر', 'الشيخ زايد', 'الهرم', 'فيصل', 'العجوزة']
  },
  {
    id: 'alex',
    name: 'الإسكندرية',
    cities: ['المنتزه', 'شرق الإسكندرية', 'وسط الإسكندرية', 'العامرية']
  },
  {
    id: 'sharkia',
    name: 'الشرقية',
    cities: ['الزقازيق', 'العاشر من رمضان', 'منيا القمح', 'فاقوس']
  }
];

export const CRAFTSMEN: Craftsman[] = [
  {
    id: 'c1',
    name: 'محمد أحمد',
    email: 'mohamed@example.com',
    phone: '01012345678',
    role: 'craftsman',
    avatar: '/placeholder.svg',
    rating: 4.8,
    location: {
      governorate: 'القاهرة',
      city: 'مدينة نصر'
    },
    specialty: 'سباك',
    bio: 'فني سباكة محترف مع خبرة 15 عام في مجال تركيب وإصلاح السباكة المنزلية والتجارية',
    completedJobs: 48,
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    availability: true,
    skills: ['تركيب سباكة حديثة', 'إصلاح تسريبات', 'صيانة مضخات المياه'],
    experience: 15,
    createdAt: new Date('2022-05-15')
  },
  {
    id: 'c2',
    name: 'أحمد محمود',
    email: 'ahmed@example.com',
    phone: '01112345678',
    role: 'craftsman',
    avatar: '/placeholder.svg',
    rating: 4.5,
    location: {
      governorate: 'الجيزة',
      city: '6 أكتوبر'
    },
    specialty: 'كهربائي',
    bio: 'فني كهرباء متخصص في التمديدات والإصلاحات الكهربائية لجميع أنواع المباني',
    completedJobs: 35,
    gallery: ['/placeholder.svg', '/placeholder.svg'],
    availability: true,
    skills: ['تركيب لوحات كهرباء', 'إصلاح أعطال كهربائية', 'تمديدات كهربائية'],
    experience: 10,
    createdAt: new Date('2022-06-20')
  },
  {
    id: 'c3',
    name: 'علي حسن',
    email: 'ali@example.com',
    phone: '01212345678',
    role: 'craftsman',
    avatar: '/placeholder.svg',
    rating: 4.9,
    location: {
      governorate: 'القاهرة',
      city: 'المعادي'
    },
    specialty: 'نقاش',
    bio: 'نقاش محترف متخصص في الديكورات الداخلية والدهانات بجميع أنواعها',
    completedJobs: 62,
    gallery: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    availability: false,
    skills: ['دهانات البلاستيك', 'دهانات الزيت', 'ورق الحائط', 'رسم وتزيين'],
    experience: 12,
    createdAt: new Date('2021-12-10')
  },
  {
    id: 'c4',
    name: 'خالد سمير',
    email: 'khaled@example.com',
    phone: '01512345678',
    role: 'craftsman',
    avatar: '/placeholder.svg',
    rating: 4.7,
    location: {
      governorate: 'الإسكندرية',
      city: 'المنتزه'
    },
    specialty: 'نجار',
    bio: 'نجار خبرة في مجال النجارة والأثاث المنزلي والمكتبي',
    completedJobs: 41,
    gallery: ['/placeholder.svg', '/placeholder.svg'],
    availability: true,
    skills: ['تصنيع أثاث', 'إصلاح أثاث قديم', 'تركيب أبواب وشبابيك', 'تفصيل مطابخ'],
    experience: 9,
    createdAt: new Date('2023-02-14')
  },
  {
    id: 'c5',
    name: 'محمود سعيد',
    email: 'mahmoud@example.com',
    phone: '01612345678',
    role: 'craftsman',
    avatar: '/placeholder.svg',
    rating: 4.3,
    location: {
      governorate: 'الجيزة',
      city: 'الهرم'
    },
    specialty: 'فني تكييف',
    bio: 'فني تكييف متخصص في تركيب وصيانة وإصلاح جميع أنواع التكييفات',
    completedJobs: 28,
    gallery: ['/placeholder.svg'],
    availability: true,
    skills: ['تركيب تكييفات', 'صيانة دورية', 'إصلاح أعطال', 'تنظيف وتعقيم'],
    experience: 7,
    createdAt: new Date('2023-05-20')
  }
];

export const JOBS: Job[] = [
  {
    id: 'j1',
    title: 'تصليح تسريب مياه في المطبخ',
    description: 'يوجد تسريب مياه تحت حوض المطبخ ويحتاج إلى إصلاح سريع',
    category: 'سباك',
    location: {
      governorate: 'القاهرة',
      city: 'مدينة نصر',
      address: 'الحي العاشر، شارع مصطفى النحاس'
    },
    budget: {
      min: 200,
      max: 400
    },
    clientId: 'client1',
    status: 'open',
    postedAt: new Date('2024-04-18'),
    applications: []
  },
  {
    id: 'j2',
    title: 'تركيب غسالة أطباق جديدة',
    description: 'نحتاج تركيب غسالة أطباق في المطبخ مع توصيلات المياه والكهرباء',
    category: 'سباك',
    location: {
      governorate: 'الجيزة',
      city: '6 أكتوبر',
      address: 'الحي السابع'
    },
    budget: {
      min: 300,
      max: 500
    },
    clientId: 'client2',
    status: 'open',
    postedAt: new Date('2024-04-20'),
    applications: []
  },
  {
    id: 'j3',
    title: 'تركيب مروحة سقف في غرفتين',
    description: 'نحتاج تركيب مروحة سقف في غرفة النوم الرئيسية وغرفة المعيشة',
    category: 'كهربائي',
    location: {
      governorate: 'القاهرة',
      city: 'المعادي',
      address: 'شارع 9، المعادي'
    },
    budget: {
      min: 400,
      max: 700
    },
    clientId: 'client3',
    status: 'open',
    postedAt: new Date('2024-04-21'),
    applications: []
  },
  {
    id: 'j4',
    title: 'دهان شقة كاملة 3 غرف',
    description: 'نحتاج دهان شقة كاملة 3 غرف ومطبخ وحمامين وطرقة مع المعجون',
    category: 'نقاش',
    location: {
      governorate: 'الإسكندرية',
      city: 'المنتزه',
    },
    budget: {
      min: 5000,
      max: 8000
    },
    clientId: 'client2',
    status: 'assigned',
    postedAt: new Date('2024-04-15'),
    applications: []
  },
  {
    id: 'j5',
    title: 'تركيب أطباق دش لـ 4 شاشات',
    description: 'تركيب نظام دش مركزي لـ 4 شاشات في شقة جديدة مع توصيل الأسلاك',
    category: 'فني دش',
    location: {
      governorate: 'الجيزة',
      city: 'الشيخ زايد',
    },
    budget: {
      min: 800,
      max: 1200
    },
    clientId: 'client4',
    status: 'open',
    postedAt: new Date('2024-04-22'),
    applications: []
  }
];
