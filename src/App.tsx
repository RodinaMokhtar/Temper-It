import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Sectors } from './components/Sectors';
import { LiveSimulator } from './components/LiveSimulator';
import { Products } from './components/Products';
import { CheckoutSection } from './components/CheckoutSection';
import { FAQAndSupport } from './components/FAQAndSupport';
import { Footer } from './components/Footer';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { AdminModal } from './components/AdminModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { MobileStickyCheckoutBar } from './components/MobileStickyCheckoutBar';
import { PaymentGatewayModal } from './components/PaymentGatewayModal';
import { WhatsAppInquiryModal } from './components/WhatsAppInquiryModal';
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from './data/mockData';
import { ProductItem, OrderItem } from './types';
import { 
  saveOrderToFirestore, 
  updateOrderStatusInFirestore, 
  subscribeToOrders, 
  subscribeToSettings, 
  saveBasePriceToFirestore,
  checkIsAdmin,
  auth 
} from './services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [basePrice, setBasePrice] = useState<number>(() => {
    const saved = localStorage.getItem('temper_it_base_price');
    return saved ? parseInt(saved, 10) : 1300;
  });

  const [products, setProducts] = useState<ProductItem[]>(() => {
    return INITIAL_PRODUCTS.map((p) => {
      if (p.id === 'starter') return { ...p, price: basePrice };
      return p;
    });
  });

  const [orders, setOrders] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem('temper_it_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [selectedProductId, setSelectedProductId] = useState<string>('starter');
  const [selectedSector, setSelectedSector] = useState<string>('البيوت');
  const [adminModalOpen, setAdminModalOpen] = useState<boolean>(false);
  const [latestOrder, setLatestOrder] = useState<OrderItem | null>(null);

  // Conversational commerce & gateway modals
  const [paymentGatewayOpen, setPaymentGatewayOpen] = useState<boolean>(false);
  const [gatewayTargetOrder, setGatewayTargetOrder] = useState<OrderItem | null>(null);
  const [inquiryModalOpen, setInquiryModalOpen] = useState<boolean>(false);

  // Track Auth state to safely access authorized resources
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  // Subscribe to live settings from Firebase Firestore (public read)
  useEffect(() => {
    const unsubscribeSettings = subscribeToSettings(({ basePrice: remotePrice }) => {
      if (remotePrice && remotePrice > 0) {
        setBasePrice(remotePrice);
        localStorage.setItem('temper_it_base_price', remotePrice.toString());
        setProducts((prev) =>
          prev.map((p) => (p.id === 'starter' ? { ...p, price: remotePrice } : p))
        );
      }
    });

    return () => unsubscribeSettings();
  }, []);

  // Subscribe to live orders from Firebase Firestore ONLY if authenticated as Admin
  useEffect(() => {
    if (!currentUser || !checkIsAdmin(currentUser)) {
      return;
    }

    const unsubscribeOrders = subscribeToOrders((firestoreOrders) => {
      if (firestoreOrders && firestoreOrders.length > 0) {
        setOrders((prev) => {
          // Merge firestore orders with any local orders
          const existingIds = new Set(firestoreOrders.map((o) => o.id));
          const uniqueLocal = prev.filter((o) => !existingIds.has(o.id));
          return [...firestoreOrders, ...uniqueLocal];
        });
      }
    });

    return () => unsubscribeOrders();
  }, [currentUser]);

  // Check URL query parameters for deep linking from WhatsApp
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasCheckout = params.get('checkout');
    const hasInquire = params.get('inquire');
    const itemParam = params.get('product') || params.get('item');

    if (itemParam && (itemParam === 'starter' || itemParam === 'dual' || itemParam === 'enterprise')) {
      setSelectedProductId(itemParam);
    }

    if (hasCheckout) {
      setTimeout(() => {
        handleNavigate('checkout');
      }, 500);
    } else if (hasInquire) {
      setInquiryModalOpen(true);
    }
  }, []);

  // Sync orders to localStorage as local cache
  useEffect(() => {
    localStorage.setItem('temper_it_orders', JSON.stringify(orders));
  }, [orders]);

  // Sync base price changes (to local state + Firebase)
  const handleUpdateBasePrice = (newPrice: number) => {
    setBasePrice(newPrice);
    localStorage.setItem('temper_it_base_price', newPrice.toString());
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === 'starter') return { ...p, price: newPrice };
        return p;
      })
    );

    // Save to Firestore
    const userEmail = auth.currentUser?.email || 'admin@temper-it.com';
    saveBasePriceToFirestore(newPrice, userEmail).catch((err) => {
      console.warn('Note: Firestore basePrice update:', err);
    });
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderItem['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    // Update in Firestore
    updateOrderStatusInFirestore(orderId, newStatus).catch((err) => {
      console.warn('Note: Firestore order status update:', err);
    });
  };

  const handleOrderCreated = (newOrder: OrderItem) => {
    setOrders((prev) => [newOrder, ...prev]);
    setLatestOrder(newOrder);

    // Persist immediately to Firebase Firestore
    saveOrderToFirestore(newOrder).catch((err) => {
      console.warn('Note: Firestore order save:', err);
    });
  };

  const handleOpenPaymentGateway = (order: OrderItem) => {
    setGatewayTargetOrder(order);
    setPaymentGatewayOpen(true);
  };

  const handlePaymentSuccess = (orderId: string, txnId: string, method: string) => {
    const updatedNotes = `تم السداد إلكترونياً بنجاح - رقم المعاملة: ${txnId}`;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'تم التسليم بنجاح',
              paymentMethod: method as OrderItem['paymentMethod'],
              notes: o.notes ? `${o.notes} | ${updatedNotes}` : updatedNotes,
            }
          : o
      )
    );

    // Update in Firestore
    updateOrderStatusInFirestore(orderId, 'تم التسليم بنجاح', updatedNotes).catch((err) => {
      console.warn('Note: Firestore payment update:', err);
    });
  };

  const handleNavigate = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectProductAndCheckout = (productId: string) => {
    setSelectedProductId(productId);
    handleNavigate('checkout');
  };

  const handleSelectSectorAndCheckout = (sectorName: string) => {
    setSelectedSector(sectorName);
    handleNavigate('checkout');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Bar matching controller site theme */}
      <Header
        onOpenAdmin={() => setAdminModalOpen(true)}
        onNavigate={handleNavigate}
        onOpenInquiry={() => setInquiryModalOpen(true)}
        ordersCount={orders.length}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          onOrderClick={() => handleNavigate('checkout')}
          onLiveDemoClick={() => handleNavigate('live-demo')}
          basePrice={basePrice}
        />

        {/* Target Sectors */}
        <Sectors onSelectSectorForOrder={handleSelectSectorAndCheckout} />

        {/* Live Controller Simulation Dashboard */}
        <LiveSimulator />

        {/* Products & Kits Showcase */}
        <Products
          products={products}
          onSelectProduct={handleSelectProductAndCheckout}
        />

        {/* WhatsApp & Gateway Integrated Checkout */}
        <CheckoutSection
          products={products}
          selectedProductId={selectedProductId}
          onProductChange={(id) => setSelectedProductId(id)}
          selectedSectorFromParent={selectedSector}
          onOrderCreated={handleOrderCreated}
          onOpenPaymentGateway={handleOpenPaymentGateway}
          onOpenInquiryModal={() => setInquiryModalOpen(true)}
        />

        {/* FAQ & Support Section */}
        <FAQAndSupport />
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenAdmin={() => setAdminModalOpen(true)}
      />

      {/* Floating WhatsApp CTA */}
      <FloatingWhatsApp onOpenInquiry={() => setInquiryModalOpen(true)} />

      {/* Mobile-Only Sticky Checkout Bar */}
      <MobileStickyCheckoutBar
        products={products}
        selectedProductId={selectedProductId}
        onCheckoutClick={(prodId) => {
          if (prodId) setSelectedProductId(prodId);
          handleNavigate('checkout');
        }}
      />

      {/* WhatsApp Inquiry Templates Modal */}
      <WhatsAppInquiryModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        onDirectOrderClick={() => handleNavigate('checkout')}
        basePrice={basePrice}
      />

      {/* Interactive Paymob & InstaPay Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={paymentGatewayOpen}
        order={gatewayTargetOrder}
        onClose={() => {
          setPaymentGatewayOpen(false);
          setGatewayTargetOrder(null);
        }}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Order Confirmation & Invoice Modal */}
      <OrderSuccessModal
        order={latestOrder}
        onClose={() => setLatestOrder(null)}
      />

      {/* Admin / Startup Dashboard Modal with Firebase Auth */}
      <AdminModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        orders={orders}
        basePrice={basePrice}
        onUpdateBasePrice={handleUpdateBasePrice}
        onUpdateOrderStatus={handleUpdateOrderStatus}
      />
    </div>
  );
}
