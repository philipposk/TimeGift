import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';

// Helper to convert Firestore timestamps to Date
export function firestoreTimestampToDate(timestamp: any): Date | null {
  if (!timestamp) return null;
  if (timestamp.toDate) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp === 'string') return new Date(timestamp);
  return null;
}

// Helper to convert Date to Firestore timestamp
export function dateToFirestoreTimestamp(date: Date | null): any {
  if (!date) return null;
  return Timestamp.fromDate(date);
}

// Generic get document
export async function getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as T;
  } catch (error) {
    console.error(`Error getting document ${collectionName}/${docId}:`, error);
    return null;
  }
}

// Generic get documents with filters
export async function getDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  try {
    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    return [];
  }
}

// Generic create/update document
export async function setDocument(
  collectionName: string,
  docId: string,
  data: any
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      updated_at: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error(`Error setting document ${collectionName}/${docId}:`, error);
    throw error;
  }
}

// Generic update document
export async function updateDocument(
  collectionName: string,
  docId: string,
  data: any
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error updating document ${collectionName}/${docId}:`, error);
    throw error;
  }
}

// Generic delete document
export async function deleteDocument(collectionName: string, docId: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document ${collectionName}/${docId}:`, error);
    throw error;
  }
}

// Export Firestore utilities
export { collection, doc, query, where, orderBy, limit, serverTimestamp, Timestamp };
