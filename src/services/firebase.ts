import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  collection, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp,
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { OrderItem } from '../types';

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with the specific firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const BOOTSTRAP_ADMIN_EMAIL = 'rodina.ibrahim2022@gmail.com';

// Error handling contracts required by Firebase skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on application boot as required by skill
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'settings', 'general'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// Check if user has admin privileges
export function checkIsAdmin(user: User | null): boolean {
  if (!user || !user.email) return false;
  return user.email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
}

// Sign in with Google (Popup method preferred for AI Studio runtime)
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error('Failed to sign in with Google:', err);
    throw err;
  }
}

// Sign out
export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Failed to sign out:', err);
    throw err;
  }
}

// Save Order to Firestore
export async function saveOrderToFirestore(order: OrderItem): Promise<void> {
  const path = `orders/${order.id}`;
  try {
    // Sanitize payload according to schema
    const payload: Record<string, any> = {
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      productId: order.productId,
      quantity: Number(order.quantity),
      totalPrice: Number(order.totalPrice),
      paymentMethod: order.paymentMethod,
      status: 'معلق (بانتظار واتساب)',
    };

    if (order.businessName) payload.businessName = order.businessName;
    if (order.sector) payload.sector = order.sector;
    if (order.productName) payload.productName = order.productName;
    if (order.unitPrice) payload.unitPrice = Number(order.unitPrice);
    if (order.governorate) payload.governorate = order.governorate;
    if (order.address) payload.address = order.address;
    if (order.notes) payload.notes = order.notes;
    if (order.createdAt) payload.createdAt = order.createdAt;

    await setDoc(doc(db, 'orders', order.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Update Order in Firestore (Admin only)
export async function updateOrderStatusInFirestore(
  orderId: string,
  newStatus: OrderItem['status'],
  notesUpdate?: string
): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const updatePayload: Record<string, any> = {
      status: newStatus,
    };
    if (notesUpdate !== undefined) {
      updatePayload.notes = notesUpdate;
    }
    await updateDoc(doc(db, 'orders', orderId), updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Subscribe to Orders (Admin only)
export function subscribeToOrders(
  onOrders: (orders: OrderItem[]) => void,
  onError?: (err: any) => void
): () => void {
  // Only attempt to subscribe if an authenticated user with admin privileges is present
  if (!auth.currentUser || !checkIsAdmin(auth.currentUser)) {
    return () => {};
  }

  const path = 'orders';
  try {
    const ordersCol = collection(db, 'orders');
    return onSnapshot(
      ordersCol,
      (snapshot) => {
        const items: OrderItem[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          items.push({
            id: d.id,
            orderNumber: data.orderNumber || d.id,
            customerName: data.customerName || '',
            customerPhone: data.customerPhone || '',
            businessName: data.businessName || '',
            sector: data.sector || 'معمل تحاليل طبي',
            productId: data.productId || 'starter',
            productName: data.productName || 'جهاز Temper-IT الذكي',
            quantity: data.quantity || 1,
            unitPrice: data.unitPrice || 1300,
            totalPrice: data.totalPrice || 1300,
            governorate: data.governorate || 'القاهرة',
            address: data.address || '',
            paymentMethod: data.paymentMethod || 'الدفع عند الاستلام (COD)',
            status: data.status || 'معلق (بانتظار واتساب)',
            notes: data.notes || '',
            createdAt: data.createdAt || '',
          });
        });
        onOrders(items);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

// Subscribe to Base Price & Store Settings
export function subscribeToSettings(
  onSettings: (settings: { basePrice: number }) => void
): () => void {
  const path = 'settings/general';
  try {
    return onSnapshot(
      doc(db, 'settings', 'general'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data && typeof data.basePrice === 'number') {
            onSettings({ basePrice: data.basePrice });
          }
        }
      },
      (error) => {
        console.warn('Settings read note (using defaults):', error);
      }
    );
  } catch (error) {
    console.warn('Settings error:', error);
    return () => {};
  }
}

// Save Settings to Firestore (Admin only)
export async function saveBasePriceToFirestore(
  newPrice: number,
  adminEmail: string
): Promise<void> {
  const path = 'settings/general';
  try {
    await setDoc(doc(db, 'settings', 'general'), {
      basePrice: newPrice,
      officialPhone: '+201150902000',
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail,
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
