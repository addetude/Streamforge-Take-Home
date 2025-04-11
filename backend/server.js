const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message 
  });
});

// Load creator data
let creatorsData = [];
try {
  const filePath = path.join(__dirname, '../data/creators.json');
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Data file not found: ${filePath}`);
  }
  
  const fileContent = fs.readFileSync(filePath, 'utf8');
  creatorsData = JSON.parse(fileContent);
  
  if (!Array.isArray(creatorsData)) {
    throw new Error('Invalid data format: expected an array of creators');
  }

  // Validate that each creator has required fields
  creatorsData.forEach((creator, index) => {
    if (!creator.username || !creator.platform || !creator.followers) {
      console.warn(`Creator at index ${index} is missing required fields`);
    }
  });
  
  console.log(`Successfully loaded ${creatorsData.length} creators`);
} catch (err) {
  console.error('Failed to load creators data:', err);
  creatorsData = []; // Initialize with empty array to prevent crashes
}

// Initialize default campaign settings
const defaultCampaignSettings = {
  budget: [0, 1000],
  targetGenres: [],
  targetAgeGroups: [],
  targetGenders: [],
  campaignObjective: null
};

// Initialize creators without match scores
creatorsData.forEach(creator => {
  creator.matchScore = null;
});

// GET all creators
app.get('/api/creators', (req, res) => {
  try {
    // Return a copy of the creators data with match scores and transformed demographics
    const creatorsWithScores = creatorsData.map(creator => {
      try {
        // Ensure creator has all required properties to avoid potential errors
        if (!creator.audienceDemographics || !creator.audienceDemographics.age || !creator.audienceDemographics.gender) {
          return {
            ...creator,
            age: null,
            gender: null,
            matchScore: creator.matchScore
          };
        }

        // Get the most common age group
        const ageGroups = creator.audienceDemographics.age;
        const mostCommonAgeGroup = Object.entries(ageGroups).reduce((a, b) => a[1] > b[1] ? a : b, ['unknown', 0])[0];
        const age = mostCommonAgeGroup.includes('-') ? mostCommonAgeGroup.split('-')[0] : mostCommonAgeGroup;

        // Get the most common gender
        const genders = creator.audienceDemographics.gender;
        const mostCommonGender = Object.entries(genders).reduce((a, b) => a[1] > b[1] ? a : b, ['unknown', 0])[0];

        return {
          ...creator,
          age: age,
          gender: mostCommonGender,
          matchScore: creator.matchScore
        };
      } catch (err) {
        console.error(`Error processing creator ${creator.username}:`, err);
        // Return creator with safe fallback values to prevent cascade failures
        return {
          ...creator,
          age: null,
          gender: null,
          matchScore: creator.matchScore
        };
      }
    });
    
    res.json(creatorsWithScores);
  } catch (err) {
    console.error('Error fetching creators:', err);
    res.status(500).json({ error: 'Failed to retrieve creators' });
  }
});

// GET filtered creators
app.get('/api/creators/filter', (req, res) => {
  try {
    // Implement filtering logic based on query parameters
    let filteredCreators = [...creatorsData];
    const { 
      platforms, 
      categories, 
      followerRange, 
      engagementRateMin, 
      regions, 
      verifiedOnly, 
      matchScoreMin,
      genres
    } = req.query;
    
    // Filter by platform
    if (platforms && platforms.length > 0) {
      const platformArray = Array.isArray(platforms) ? platforms : [platforms];
      filteredCreators = filteredCreators.filter(creator => 
        platformArray.includes(creator.platform)
      );
    }
    
    // Filter by content categories
    if (categories && categories.length > 0) {
      const categoryArray = Array.isArray(categories) ? categories : [categories];
      filteredCreators = filteredCreators.filter(creator => 
        creator.contentCategories && creator.contentCategories.some(category => categoryArray.includes(category))
      );
    }
    
    // Filter by genres
    if (genres && genres.length > 0) {
      const genreArray = Array.isArray(genres) ? genres : [genres];
      filteredCreators = filteredCreators.filter(creator => 
        creator.contentCategories && creator.contentCategories.some(genre => genreArray.includes(genre))
      );
    }
    
    // Filter by follower range
    if (followerRange) {
      try {
        let min = 0, max = Number.MAX_SAFE_INTEGER;
        
        if (Array.isArray(followerRange)) {
          min = parseInt(followerRange[0]) || 0;
          max = parseInt(followerRange[1]) || Number.MAX_SAFE_INTEGER;
        } else {
          // Safely handle JSON parsing with error handling
          const rangeData = JSON.parse(followerRange);
          if (Array.isArray(rangeData) && rangeData.length >= 2) {
            min = parseInt(rangeData[0]) || 0;
            max = parseInt(rangeData[1]) || Number.MAX_SAFE_INTEGER;
          }
        }
        
        // Validate range values
        if (min < 0) min = 0;
        if (max < min) max = min;
        
        filteredCreators = filteredCreators.filter(creator => {
          const followers = parseInt(creator.followers) || 0;
          return followers >= min && followers <= max;
        });
      } catch (err) {
        console.error('Error parsing follower range:', err);
        // Continue without applying this filter if there's a parsing error
      }
    }
    
    // Filter by minimum engagement rate
    if (engagementRateMin) {
      const minRate = parseFloat(engagementRateMin) || 0;
      filteredCreators = filteredCreators.filter(creator => 
        (creator.engagementRate || 0) >= minRate
      );
    }
    
    // Filter by regions
    if (regions && regions.length > 0) {
      const regionArray = Array.isArray(regions) ? regions : [regions];
      filteredCreators = filteredCreators.filter(creator => 
        creator.location && regionArray.includes(creator.location)
      );
    }
    
    // Filter by verified status
    if (verifiedOnly === 'true') {
      filteredCreators = filteredCreators.filter(creator => creator.verified === true);
    }

    // Filter by match score if specified
    if (matchScoreMin) {
      const minScore = parseInt(matchScoreMin) || 0;
      filteredCreators = filteredCreators.filter(creator => 
        creator.matchScore !== null && creator.matchScore >= minScore
      );
    }
    
    // Transform creator data to include age and gender
    filteredCreators = filteredCreators.map(creator => {
      try {
        // Check for required properties
        if (!creator.audienceDemographics || !creator.audienceDemographics.age) {
          return {
            ...creator,
            age: null,
            gender: creator.gender || null,
            matchScore: creator.matchScore
          };
        }
        
        // Get the most common age group with safety checks
        const ageGroups = creator.audienceDemographics.age;
        const mostCommonAgeGroup = Object.entries(ageGroups).reduce((a, b) => a[1] > b[1] ? a : b, ['unknown', 0])[0];
        const age = mostCommonAgeGroup.includes('-') ? mostCommonAgeGroup.split('-')[0] : mostCommonAgeGroup;

        // Find the original creator to get the match score
        const originalCreator = creatorsData.find(c => c.username === creator.username);
        
        return {
          ...creator,
          age: age,
          gender: creator.gender || null,
          matchScore: originalCreator ? originalCreator.matchScore : null
        };
      } catch (err) {
        console.error(`Error processing creator in filter results: ${creator.username}`, err);
        // Return creator with minimal processing if an error occurs
        return {
          ...creator,
          matchScore: creator.matchScore
        };
      }
    });
    
    res.json(filteredCreators);
  } catch (err) {
    console.error('Error filtering creators:', err);
    res.status(500).json({ error: 'Failed to filter creators', message: err.message });
  }
});

// POST calculate match scores
app.post('/api/match', (req, res) => {
  try {
    // Implementation of the match score calculation algorithm
    const campaignSettings = req.body;
    
    // Validate campaign settings object
    if (!campaignSettings || typeof campaignSettings !== 'object') {
      return res.status(400).json({ error: 'Invalid campaign settings format' });
    }
    
    // Calculate match scores for all creators and update the creators data
    const updatedCreators = creatorsData.map(creator => {
      try {
        // Validate creator object before processing
        if (!creator || typeof creator !== 'object') {
          return {
            error: 'Invalid creator data',
            matchScore: null
          };
        }
        
        const matchScore = calculateMatchScore(creator, campaignSettings);
        
        // Update the match score in the original creators data array
        const originalCreator = creatorsData.find(c => c.username === creator.username);
        if (originalCreator) {
          originalCreator.matchScore = matchScore;
        }
        
        // Get demographic information with error handling
        let age = null;
        let gender = null;
        
        try {
          if (creator.audienceDemographics && creator.audienceDemographics.age) {
            const ageGroups = creator.audienceDemographics.age;
            const mostCommonAgeGroup = Object.entries(ageGroups).reduce((a, b) => a[1] > b[1] ? a : b, ['unknown', 0])[0];
            age = mostCommonAgeGroup.includes('-') ? mostCommonAgeGroup.split('-')[0] : mostCommonAgeGroup;
          }
          
          if (creator.audienceDemographics && creator.audienceDemographics.gender) {
            const genders = creator.audienceDemographics.gender;
            gender = Object.entries(genders).reduce((a, b) => a[1] > b[1] ? a : b, ['unknown', 0])[0];
          }
        } catch (err) {
          console.error(`Error extracting demographics for creator ${creator.username}:`, err);
        }

        return {
          ...creator,
          age: age,
          gender: gender,
          matchScore: matchScore
        };
      } catch (err) {
        console.error(`Error calculating match score for creator ${creator.username}:`, err);
        // Return creator with error info but don't break the whole response
        return {
          ...creator,
          matchScore: null,
          matchError: 'Failed to calculate match score'
        };
      }
    });
    
    res.json(updatedCreators);
  } catch (err) {
    console.error('Error in match score calculation:', err);
    res.status(500).json({ error: 'Failed to calculate match scores', message: err.message });
  }
});

// Match score calculation algorithm
function calculateMatchScore(creator, campaignSettings) {
  try {
    // Define weight configurations for different campaign objectives
    const weightConfigs = {
      brand_awareness: {
        budgetFit: 0.22,
        contentRelevance: 0.22,
        audienceFit: 0.22,
        engagementQuality: 0.18,
        previousPerformance: 0.16
      },
      product_launch: {
        budgetFit: 0.22,
        contentRelevance: 0.24,
        audienceFit: 0.20,
        engagementQuality: 0.18,
        previousPerformance: 0.16
      },
      community_engagement: {
        budgetFit: 0.20,
        contentRelevance: 0.20,
        audienceFit: 0.24,
        engagementQuality: 0.20,
        previousPerformance: 0.16
      },
      conversion: {
        budgetFit: 0.22,
        contentRelevance: 0.22,
        audienceFit: 0.20,
        engagementQuality: 0.20,
        previousPerformance: 0.16
      },
      default: {
        budgetFit: 0.22,
        contentRelevance: 0.22,
        audienceFit: 0.22,
        engagementQuality: 0.18,
        previousPerformance: 0.16
      }  
    };
    
    // Validate input parameters
    if (!creator || !campaignSettings) {
      console.warn('Missing parameters for match score calculation');
      return 50; // Return neutral score
    }

    // Get weights based on campaign objective, fallback to default if not specified
    const weights = weightConfigs[campaignSettings.campaignObjective] || weightConfigs.default;
    
    // Calculate individual component scores
    let budgetFitScore = calculateBudgetFit(creator, campaignSettings);
    let contentRelevanceScore = calculateContentRelevance(creator, campaignSettings);
    let audienceFitScore = calculateAudienceFit(creator, campaignSettings);
    let engagementQualityScore = calculateEngagementQuality(creator);
    let previousPerformanceScore = normalizePreviousPerformance(creator);
    
    
    // Platform-based score adjustments
    try {
      if (creator.platform) {
        switch (creator.platform) {
          case 'TikTok':
            if (campaignSettings.targetAgeGroups && campaignSettings.targetAgeGroups.some(age => age < 30)) {
              audienceFitScore *= 1.1; // Younger audiences
            }
            if (campaignSettings.campaignObjective === 'brand_awareness') {
              engagementQualityScore *= 1.1; // Viral reach potential
            }
            if (campaignSettings.campaignObjective === 'product_launch') {
              contentRelevanceScore *= 1.05; // Quick product impressions
            }
            break;
    
          case 'YouTube':
            previousPerformanceScore *= 1.2; // Long-form content shows execution quality
            if (campaignSettings.campaignObjective === 'conversion') {
              contentRelevanceScore *= 1.1; // In-depth reviews & CTAs
            }
            if (campaignSettings.campaignObjective === 'community_engagement') {
              engagementQualityScore *= 1.05; // Comment section & subscriber loyalty
            }
            break;
    
          case 'Instagram':
            if (campaignSettings.campaignObjective === 'product_launch') {
              contentRelevanceScore *= 1.15; // Aesthetic product showcases
            }
            if (campaignSettings.campaignObjective === 'brand_awareness') {
              audienceFitScore *= 1.05; // Visual brand consistency
            }
            if (campaignSettings.campaignObjective === 'conversion') {
              engagementQualityScore *= 1.1; // Link clicks & story interaction
            }
            break;
    
          case 'Twitch':
            if (campaignSettings.campaignObjective === 'community_engagement') {
              engagementQualityScore *= 1.2; // Real-time chat = high interaction
            }
            if (campaignSettings.targetGenres && campaignSettings.targetGenres.includes('gaming')) {
              contentRelevanceScore *= 1.15; // Perfect content match
            }
            if (campaignSettings.targetGenders === 'male') {
              audienceFitScore *= 1.05; // Typically male, 18-35 audience
            }
            break;
    
          case 'Twitter':
            if (campaignSettings.campaignObjective === 'brand_awareness') {
              engagementQualityScore *= 1.1; // Quick viral potential
            }
            if (campaignSettings.campaignObjective === 'product_launch') {
              contentRelevanceScore *= 1.05; // Real-time buzz creation
            }
            audienceFitScore *= 0.95; // Slightly less control over targeting
            break;
        }
      }
    } catch (err) {
      console.error('Error in platform score adjustments:', err);
      // Continue with unadjusted scores
    }

    // Combine scores using weights
    const matchScore = (
      (budgetFitScore * weights.budgetFit) +
      (contentRelevanceScore * weights.contentRelevance) +
      (audienceFitScore * weights.audienceFit) +
      (engagementQualityScore * weights.engagementQuality) +
      (previousPerformanceScore * weights.previousPerformance)
    ) * 100;
    
    // Ensure score is between 0-100
    return Math.min(100, Math.max(0, Math.round(matchScore)));
  } catch (err) {
    console.error('Error calculating match score:', err);
    return 50; // Return a neutral score on error
  }
}

// Calculate how well creator's rate fits within campaign budget
function calculateBudgetFit(creator, campaignSettings) {
  if (!campaignSettings.budget || !Array.isArray(campaignSettings.budget) || campaignSettings.budget.length !== 2) {
    return 0.5; // Default score if budget isn't properly specified
  }
  
  const [minBudget, maxBudget] = campaignSettings.budget;
  const creatorRate = creator.hourlyRate;
  
  if (creatorRate < minBudget) {
    // Below budget - score decreases as the gap increases
    return Math.max(0, 1 - (minBudget - creatorRate) / minBudget);
  } else if (creatorRate > maxBudget) {
    // Above budget - score decreases as the gap increases
    return Math.max(0, 1 - (creatorRate - maxBudget) / maxBudget);
  } else {
    // Within budget - full score
    return 1;
  }
}

// Calculate how relevant creator's content is to the campaign
function calculateContentRelevance(creator, campaignSettings) {
  const targetGenres = campaignSettings.targetGenres || [];
  const creatorCategories = creator.contentCategories || [];

  // If no target genres specified, return default neutral relevance
  if (targetGenres.length === 0) return 1;
  if (creatorCategories.length === 0) return 0;

  // If creator includes ALL target genres → perfect score
  const matchesAllGenres = targetGenres.every(genre =>
    creatorCategories.includes(genre)
  );
  if (matchesAllGenres) return 1;

  // Otherwise: partial match based on ratio of matched genres
  const matchedGenres = targetGenres.filter(genre =>
    creatorCategories.includes(genre)
  );
  return matchedGenres.length / targetGenres.length;
}


// Calculate audience demographic fit
function calculateAudienceFit(creator, campaignSettings) {
  if (!creator.audienceDemographics || 
      !campaignSettings.targetAgeGroups || 
      !campaignSettings.targetGenders) {
    return 1; // Default score if demographics aren't specified
  }
  
  const targetAgeGroups = campaignSettings.targetAgeGroups;
  const targetGenders = campaignSettings.targetGenders;
  
  // Skip if no target demographics selected
  if (targetAgeGroups.length === 0 && targetGenders.length === 0) {
    return 1;
  }
  
  let ageScore = 0.5;
  let genderScore = 0.5;
  
  // Calculate age group match
  if (targetAgeGroups.length > 0) {
    const creatorAgeGroups = creator.audienceDemographics.age;
    let targetAgePercentage = 0;
    
    // Sum up the percentages of target age groups
    targetAgeGroups.forEach(ageGroup => {
      if (creatorAgeGroups[ageGroup]) {
        targetAgePercentage += creatorAgeGroups[ageGroup];
      }
    });
    
    // Score is normalized by the total age percentage
    const totalAgePercent = Object.values(creatorAgeGroups).reduce((sum, val) => sum + val, 0) || 100;
    ageScore = targetAgePercentage / totalAgePercent;

  }
  
  // Calculate gender match
  if (targetGenders.length > 0) {
    const creatorGenders = creator.audienceDemographics.gender;
    let targetGenderPercentage = 0;
    
    // Sum up the percentages of target genders
    targetGenders.forEach(gender => {
      if (creatorGenders[gender]) {
        targetGenderPercentage += creatorGenders[gender];
      }
    });
    
    genderScore = targetGenderPercentage / 100;
  }
  
  // Average age and gender scores for overall demographic match
  return (ageScore + genderScore) / 2;
}

// Calculate engagement quality score
function calculateEngagementQuality(creator) {
  // Normalize engagement rate to a 0-1 scale (considering 15% as excellent)
  const normalizedEngagement = Math.min(1, creator.engagementRate / 15);
  
  // Normalize follower count to a 0-1 scale (considering 2M as maximum)
  const normalizedFollowers = Math.min(1, creator.followers / 2000000);
  
  // Engagement quality considers both metrics, with emphasis on engagement rate
  return (normalizedEngagement * 0.7) + (normalizedFollowers * 0.3);
}

// Normalize previous performance score
function normalizePreviousPerformance(creator) {
  // Convert campaign performance (0-100) to a 0-1 scale
  return creator.previousCampaignPerformance / 100;
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});