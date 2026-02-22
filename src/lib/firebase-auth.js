import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

/**
 * Sign in with email and password
 */
export const loginWithEmail = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error('Login error:', error.message);
        throw error;
    }
};

/**
 * Register new user
 */
export const registerWithEmail = async (email, password, displayName, role = 'user') => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update display name
        await updateProfile(user, { displayName });

        // Create user document in Firestore
        const userData = {
            uid: user.uid,
            email,
            displayName,
            role,
            isApproved: true, // All users auto-approved as requested
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        await setDoc(doc(db, 'users', user.uid), userData);

        return user;
    } catch (error) {
        console.error('Registration error:', error.message);
        throw error;
    }
};

/**
 * Sign out
 */
export const logoutUser = async () => {
    await signOut(auth);
};

/**
 * Get current user data from Firestore
 */
export const getUserData = async (uid) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            return userDoc.data();
        }
        return null;
    } catch (error) {
        console.error('GetUserDoc error:', error.message);
        return null;
    }
};

/**
 * Auth state observer
 */
export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};

export { auth };
