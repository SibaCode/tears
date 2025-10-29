// src/utils/counsellorMatcher.js
import { 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy 
} from 'firebase/firestore';

// Function to find the best counsellor for a case
export const findBestCounsellor = async (db, caseDetails) => {
  try {
    // Get all active counsellors
    const counsellorsQuery = query(
      collection(db, 'users'),
      where('role', '==', 'counsellor'),
      where('isActive', '==', true)
    );
    
    const counsellorsSnapshot = await getDocs(counsellorsQuery);
    const counsellors = counsellorsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get current case counts for each counsellor
    const counsellorsWithWorkload = await Promise.all(
      counsellors.map(async (counsellor) => {
        const casesQuery = query(
          collection(db, 'cases'),
          where('assignedCounsellorId', '==', counsellor.id),
          where('status', 'in', ['new', 'inProgress'])
        );
        const casesSnapshot = await getDocs(casesQuery);
        const currentCases = casesSnapshot.size;
        
        return {
          ...counsellor,
          currentCases,
          availableSlots: counsellor.maxCases - currentCases
        };
      })
    );

    // Filter counsellors who have available slots
    const availableCounsellors = counsellorsWithWorkload.filter(
      c => c.availableSlots > 0
    );

    if (availableCounsellors.length === 0) {
      return null; // No available counsellors
    }

    // Score each counsellor based on matching criteria
    const scoredCounsellors = availableCounsellors.map(counsellor => {
      let score = 0;
      
      // Specialization matching (highest priority)
      if (caseDetails.specializationNeeded && counsellor.specialization) {
        const caseSpecializations = caseDetails.specializationNeeded.toLowerCase().split(',');
        const counsellorSpecializations = counsellor.specialization.toLowerCase().split(',');
        
        const matches = caseSpecializations.filter(spec => 
          counsellorSpecializations.some(counsellorSpec => 
            counsellorSpec.includes(spec.trim()) || spec.trim().includes(counsellorSpec)
          )
        );
        score += matches.length * 10;
      }

      // Language matching
      if (caseDetails.preferredLanguage && counsellor.languages) {
        if (counsellor.languages.includes(caseDetails.preferredLanguage)) {
          score += 5;
        }
      }

      // Workload balancing (prefer counsellors with more available slots)
      score += counsellor.availableSlots * 2;

      // Experience level matching
      if (caseDetails.complexity === 'high' && counsellor.experienceLevel === 'senior') {
        score += 8;
      } else if (caseDetails.complexity === 'medium' && counsellor.experienceLevel === 'intermediate') {
        score += 5;
      }

      return {
        ...counsellor,
        matchScore: score
      };
    });

    // Sort by match score (highest first) and return the best match
    const bestMatch = scoredCounsellors.sort((a, b) => b.matchScore - a.matchScore)[0];
    
    return bestMatch;

  } catch (error) {
    console.error('Error in counsellor matching:', error);
    return null;
  }
};

// Function to get counsellor workload statistics
export const getCounsellorWorkload = async (db, counsellorId) => {
  try {
    const activeCasesQuery = query(
      collection(db, 'cases'),
      where('assignedCounsellorId', '==', counsellorId),
      where('status', 'in', ['new', 'inProgress'])
    );
    
    const closedCasesQuery = query(
      collection(db, 'cases'),
      where('assignedCounsellorId', '==', counsellorId),
      where('status', '==', 'closed')
    );

    const [activeSnapshot, closedSnapshot] = await Promise.all([
      getDocs(activeCasesQuery),
      getDocs(closedCasesQuery)
    ]);

    return {
      activeCases: activeSnapshot.size,
      closedCases: closedSnapshot.size,
      totalCases: activeSnapshot.size + closedSnapshot.size
    };
  } catch (error) {
    console.error('Error getting counsellor workload:', error);
    return { activeCases: 0, closedCases: 0, totalCases: 0 };
  }
};