// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // In src/context/AuthContext.js - Update the login function
const login = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
  // Get user data from Firestore
  const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
  if (userDoc.exists()) {
    const userData = userDoc.data();
    setUserRole(userData.role);
    setUserData(userData);
  } else {
    throw new Error('User not authorized. Please contact administrator.');
  }
  
  return userCredential;
};

  const logout = () => {
    setUserRole(null);
    setUserData(null);
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData.role);
            setUserData(userData);
          } else {
            setUserRole(null);
            setUserData(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserRole(null);
          setUserData(null);
        }
      } else {
        setUserRole(null);
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    userData,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;