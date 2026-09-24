import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowLeft, Zap, ShieldCheck } from 'lucide-react';
import { ProductItem } from '../types';

interface MobileStickyCheckoutBarProps {
  products: ProductItem[];
  selectedProductId?: string;
  onCheckoutClick: (productId?: string) => void;
}

export const MobileStickyCheckoutBar: React.FC<MobileStickyCheckoutBarProps> = ({
  products,
  selectedProductId,
  onCheckoutClick,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const activeProduct =
    products.find((p) => p.id === selectedProductId) || products[0] || {
      id: 'starter',
      name: 'جهاز وحساس Temper-IT الذكي',
      price: 1300,
    };

  useEffect(() => {
    const handleScroll = () => {
      // Show when user scrolls past 280px (past top hero) and hide when inside or past the checkout form itself
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const checkoutEl = document.getElementById('checkout');
      
      let inCheckout = false;
      if (checkoutEl) {
        const rect = checkoutEl.getBoundingClientRect();
        // If checkout form is currently within viewport view
        if (rect.top <= window.innerHeight * 0.75 && rect.bottom >= 100) {
          inCheckout = true;
        }
      }

      if (scrollY > 280 && !inCheckout) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-8px_25px_rgba(0,0,0,0.08)] px-4 py-2.5 transition-all duration-300 transform translate-y-0"
      style={{ animation: 'slideUpFade 0.25s ease-out' }}
      dir="rtl"
    >
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        {/* Product price & micro summary */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-slate-900 font-mono">
              {activeProduct.price.toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-slate-500">ج.م</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-md mr-1 border border-emerald-200">
              توصيل متاح
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium truncate">
            {activeProduct.name}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => onCheckoutClick(activeProduct.id)}
          className="bg-sky-600 active:bg-sky-700 hover:bg-sky-700 text-white text-xs font-black px-4 py-3 rounded-xl shadow-md shadow-sky-600/30 flex items-center gap-1.5 shrink-0 cursor-pointer transition-transform active:scale-95"
        >
          <ShoppingBag className="w-4 h-4 shrink-0 stroke-[2.5]" />
          <span>طلب الجهاز الآن</span>
          <ArrowLeft className="w-3.5 h-3.5 mr-0.5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
