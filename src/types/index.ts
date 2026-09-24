export type BusinessSector =
  | 'البيوت'
  | 'معمل تحاليل طبي'
  | 'مستشفى / بنك دم'
  | 'صيدلية'
  | 'سوبرماركت / بقالة'
  | 'مخازن أدوية وشحن مبرد'
  | 'أخرى';

export type PaymentMethod =
  | 'الدفع عند الاستلام (COD)'
  | 'إنستاباي (InstaPay)'
  | 'فودافون كاش / محفظة ذكية'
  | 'تحويل بنكي رسمي';

export interface ProductItem {
  id: string;
  name: string;
  tag: string;
  price: number;
  devicesCount: number;
  description: string;
  popular?: boolean;
  features: string[];
  image?: string;
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  businessName: string;
  sector: BusinessSector;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  governorate: string;
  address: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  status: 'معلق (بانتظار واتساب)' | 'تم التواصل والتأكيد' | 'جاري التجهيز والشحن' | 'تم التسليم بنجاح' | 'ملغي';
}

export interface SensorStatus {
  temperature: number;
  targetMin: number;
  targetMax: number;
  powerStatus: 'مستقرة (220V)' | 'منقطعة (بطارية طوارئ)' | 'منفصل تماماً';
  wifiStrength: number; // percentage
  cloudSync: 'متصل (Active)' | 'جاري إعادة المحاولة...' | 'غير متصل';
  alertType: 'none' | 'high_temp' | 'low_temp' | 'power_cut';
  isOnline: boolean;
}
