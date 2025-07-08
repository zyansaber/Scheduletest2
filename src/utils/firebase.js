import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';

// Web app's Firebase configuration - Using the same one as scheduleData.js
const firebaseConfig = {
  apiKey: "AIzaSyBcczqGj5X1_w9aCX1lOK4-kgz49Oi03Bg",
  authDomain: "scheduling-dd672.firebaseapp.com",
  databaseURL: "https://scheduling-dd672-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "scheduling-dd672",
  storageBucket: "scheduling-dd672.firebasestorage.app",
  messagingSenderId: "432092773012",
  appId: "1:432092773012:web:ebc7203ea570b0da2ad281"
};

// Initialize Firebase - with error handling
let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

// Add a reminder to Firestore
export const addReminder = async (reminderData) => {
  if (!db) {
    console.error("Firebase not initialized");
    return { success: false, error: "Firebase not initialized" };
  }
  
  try {
    const docRef = await addDoc(collection(db, 'reminders'), {
      ...reminderData,
      created: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding reminder: ", error);
    return { success: false, error: error.message };
  }
};

// Get reminders for specific chassis
export const getRemindersForChassis = async (chassis) => {
  if (!db) {
    console.error("Firebase not initialized");
    return [];
  }
  
  try {
    const q = query(collection(db, 'reminders'), where('chassis', '==', chassis));
    const querySnapshot = await getDocs(q);
    
    const reminders = [];
    querySnapshot.forEach((doc) => {
      reminders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return reminders;
  } catch (error) {
    console.error("Error fetching reminders: ", error);
    return [];
  }
};

// Check for reminders that need to be sent
export const checkReminders = async (chassisDataArray) => {
  if (!db) {
    console.error("Firebase not initialized");
    return [];
  }
  
  try {
    const remindersRef = collection(db, "reminders");
    const remindersSnapshot = await getDocs(remindersRef);
    
    const remindersToSend = [];
    
    remindersSnapshot.forEach(doc => {
      const reminder = doc.data();
      
      // Find the chassis in the current data
      const chassisData = chassisDataArray.find(item => 
        item.Chassis === reminder.chassis
      );
      
      // If found and production stage has changed, add to send list
      if (chassisData && 
          chassisData["Regent Production"] !== reminder.productionStage) {
        remindersToSend.push({
          id: doc.id,
          ...reminder,
          newStage: chassisData["Regent Production"],
        });
      }
    });
    
    return remindersToSend;
  } catch (error) {
    console.error("Error checking reminders: ", error);
    return [];
  }
};

// Delete a reminder
export const deleteReminder = async (reminderId) => {
  if (!db) {
    console.error("Firebase not initialized");
    return { success: false, error: "Firebase not initialized" };
  }
  
  try {
    await deleteDoc(doc(db, 'reminders', reminderId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting reminder: ", error);
    return { success: false, error: error.message };
  }
};

export { db };