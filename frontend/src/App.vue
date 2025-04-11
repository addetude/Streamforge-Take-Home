<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';

// Components
import AppHeader from './components/AppHeader.vue';
import CreatorCard from './components/CreatorCard.vue';
import FilterSidebar from './components/FilterSidebar.vue';
import CampaignSettings from './components/CampaignSettings.vue';

// Initial states
const creators = ref([]);
const isLoading = ref(true);
const error = ref(null);

// Default filters
const filters = ref({
  platforms: [],
  categories: [],
  verifiedOnly: false,
  followerMin: 10000,
  followerMax: 10000000,
  selectedGenres: [],
  selectedRegions: [],
  matchScore: null
});

// Campaign settings
const campaignSettings = ref({
  budget: [0, 1000],
  targetGenres: [],
  targetAgeGroups: [],
  targetGenders: [],
  campaignObjective: null
});

// Sorting
const sortBy = ref('matchScore');
const sortDirection = ref('desc');

// Derived data
// Create set of all platforms
const selectedPlatforms = computed(() => {
  const platforms = new Set();
  creators.value.forEach(creator => platforms.add(creator.platform));
  return Array.from(platforms);
});

// Create set of all categories
const selectedCategories = computed(() => {
  const categories = new Set();
  creators.value.forEach(creator => {
    creator.contentCategories.forEach(category => categories.add(category));
  });
  return Array.from(categories);
});

// Array of creators that meet filter requirements
const filteredCreators = computed(() => {
  // Apply client-side filtering
  return creators.value.filter(creator => {
    
    // If match score is set and creator does not meet it, return false
    if (filters.value.matchScore > 0 && (creator.matchScore === null || creator.matchScore < filters.value.matchScore)) {
      return false;
    }
    
    // Filter by follower count
    if (creator.followers < filters.value.followerMin) {
      return false;
    }
    
    if (creator.followers > filters.value.followerMax) {
      return false;
    }
    
    return true;
  });
});

// Array of sorted creators
const sortedCreators = computed(() => {
  return [...filteredCreators.value].sort((a, b) => {
    const aValue = a[sortBy.value] || 0;
    const bValue = b[sortBy.value] || 0;
    
    if (sortDirection.value === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });
});

// Methods
// Update filters method
async function updateFilters(newFilters) {
  filters.value = { ...filters.value, ...newFilters };
  isLoading.value = true;
  error.value = null;
  
  try {
    // organize params from filter sidebar
    const params = {
      platforms: filters.value.platforms,
      categories: filters.value.categories,
      followerRange: [filters.value.followerMin, filters.value.followerMax],
      verifiedOnly: filters.value.verifiedOnly.toString(),
      regions: filters.value.selectedRegions,
      genres: filters.value.selectedGenres
    };
    
    // Add match score to params from slider if it is valid
    if (filters.value.matchScore && filters.value.matchScore > 0) {
      params.matchScoreMin = parseInt(filters.value.matchScore);
    }
    
    // Send params to backend
    const response = await axios.get('http://localhost:3000/api/creators/filter', { 
      params: {
        ...params,
        // avoid sending an array as a param, convert to string
        followerRange: JSON.stringify(params.followerRange)
      }
    });

    // store response in creators
    creators.value = response.data;

  // If error with applying filters
  } catch (err) {
    console.error('Error applying filters:', err);
    error.value = 'Failed to filter creators. Please try again.';
  
  // Stop loading when done
  } finally {
    isLoading.value = false;
  }
}

async function updateCampaignSettings(newSettings) {
  // update campaignSettings
  campaignSettings.value = { ...campaignSettings.value, ...newSettings };
  isLoading.value = true;
  error.value = null;
  
  try {
    // Store preferences from campaign 
    const campaignData = {
      budget: campaignSettings.value.budget,
      targetGenres: campaignSettings.value.targetGenres || [],
      targetAgeGroups: campaignSettings.value.targetAgeGroups || [],
      targetGenders: campaignSettings.value.targetGenders || [],
      campaignObjective: campaignSettings.value.campaignObjective
    };
    
    // Call the match API to calculate match scores
    const response = await axios.post('http://localhost:3000/api/match', campaignData);
    
    // Update creators with api response
    creators.value = response.data;
    
    // Reset matchScore when new campaign settings applied
    filters.value = {
      ...filters.value,
      matchScore: null
    };
  
  // error handling 
  } catch (err) {
    console.error('Error updating match scores:', err);
    error.value = 'Failed to update match scores. Please try again.';
  
  // Stop loading when done
  } finally {
    isLoading.value = false;
  }
}

// asc/desc toggle
function toggleSortDirection() {
  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
}

// Method to reset filters to original state
function resetFilters() {

  // state to be reset to
  filters.value = {
    platforms: [],
    categories: [],
    verifiedOnly: false,
    followerMin: 10000,
    followerMax: 10000000,
    selectedGenres: [],
    selectedRegions: [],
    matchScore: null
  };
  
  // Fetch all creators again
  fetchCreators();
}

// Method to load creators
async function fetchCreators() {
  isLoading.value = true;
  error.value = null;
  
  try {
    // Get creators array from api
    const response = await axios.get('http://localhost:3000/api/creators');
    
    // Update creators array with the response data
    creators.value = response.data.map(creator => ({
      ...creator,
      matchScore: null // matchScore to be initialized with Campaign Settings
    }));
    
  } catch (err) {
    console.error('Error fetching creators:', err);
    error.value = 'Failed to load creators. Please try again.';
  
  } finally {
    isLoading.value = false;
  }
}

// fetchCreators when app loads
onMounted(() => {
  fetchCreators();
});

</script>

<template>
  <div class="flex flex-col min-h-screen">
    <AppHeader />
    
    <main class="flex-grow container mx-auto p-4">
      <!-- Campaign Settings Bar -->
      <div class="mb-6">
        <CampaignSettings @settings-change="updateCampaignSettings" />
      </div>

      <div class="flex flex-col md:flex-row gap-6">
        <!-- Sidebar with filters -->
        <div class="w-full md:w-1/4">
          <FilterSidebar 
            v-model:platforms="filters.platforms"
            v-model:categories="filters.categories"
            v-model:verifiedOnly="filters.verifiedOnly"
            v-model:followerMin="filters.followerMin"
            v-model:followerMax="filters.followerMax"
            v-model:selectedRegions="filters.selectedRegions"
            v-model:selectedGenres="filters.selectedGenres"
            v-model:matchScore="filters.matchScore"
            @filter-change="updateFilters"
            @reset="resetFilters"
          />
        </div>
        
        <!-- Main content area -->
        <div class="w-full md:w-3/4">
          <div class="mb-4 flex justify-between items-center">
            <h2 class="text-xl font-bold">
              Creators
              <span v-if="!isLoading">({{ filteredCreators.length }})</span>
            </h2>
            <div class="flex gap-2">
              <select 
                v-model="sortBy" 
                class="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple"
              >
                <option value="matchScore">Match Score</option>
                <option value="followers">Followers</option>
                <option value="engagementRate">Engagement</option>
                <option value="hourlyRate">Hourly Rate</option>
              </select>
              <button 
                @click="toggleSortDirection" 
                class="border border-gray-300 rounded px-3 py-2 hover:bg-gray-100"
                aria-label="Toggle sort direction"
              >
                <i class="fas" :class="sortDirection === 'desc' ? 'fa-sort-down' : 'fa-sort-up'"></i>
              </button>
            </div>
          </div>

          <!-- Loading state -->
          <div v-if="isLoading" class="text-center p-12 bg-white rounded-lg shadow">
            <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-300 border-r-transparent" role="status">
              <span class="sr-only">Loading...</span>
            </div>
            <p class="mt-4 text-gray-600">Loading creators...</p>
          </div>
          
          <!-- Error state -->
          <div v-else-if="error" class="text-center p-12 bg-white rounded-lg border border-red-200 shadow">
            <div class="text-red-500 text-xl mb-4">
              <i class="fas fa-exclamation-circle"></i>
            </div>
            <p class="text-red-500 mb-4">{{ error }}</p>
            <button 
              @click="fetchCreators" 
              class="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
            >
              Try Again
            </button>
          </div>
          
          <!-- Empty state -->
          <div 
            v-else-if="filteredCreators.length === 0" 
            class="text-center p-12 bg-white rounded-lg shadow border border-gray-200"
          >
            <div class="text-gray-400 text-xl mb-4">
              <i class="fas fa-search"></i>
            </div>
            <p class="text-gray-500 mb-4">No creators match your filters</p>
            <button 
              @click="resetFilters" 
              class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition text-gray-800"
            >
              Reset Filters
            </button>
          </div>
          
          <!-- Creator cards grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CreatorCard 
              v-for="creator in sortedCreators" 
              :key="creator.id" 
              :creator="creator"
            />
          </div>
        </div>
      </div>
    </main>
    
    <footer class="bg-gray-800 text-white p-4 text-center mt-8">
      <p>Creator Match Dashboard</p>
    </footer>
  </div>
</template>
