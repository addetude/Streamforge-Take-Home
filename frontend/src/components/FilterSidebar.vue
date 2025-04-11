<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

// Define props
const props = defineProps({
  platforms: {
    type: Array,
    default: () => []
  },
  categories: {
    type: Array,
    default: () => []
  },
  verifiedOnly: {
    type: Boolean,
    default: false
  },
  followerMin: {
    type: Number,
    default: 10000
  },
  followerMax: {
    type: Number,
    default: 1000000
  },
  selectedGenres: {
    type: Array,
    default: () => []
  },
  selectedRegions: {
    type: Array,
    default: () => []
  },
  matchScore: {
    type: String,
    default: null
  }
});

// Define emits
const emit = defineEmits([
  'update:platforms',
  'update:categories',
  'update:verifiedOnly',
  'update:followerMin',
  'update:followerMax',
  'update:selectedGenres',
  'update:selectedRegions',
  'update:matchScore',
  'filter-change',
  'reset'
]);

// Local state for filter values
const localFilters = ref({
  platforms: [],
  categories: [],
  followerMin: 0,
  followerMax: 10000000,
  engagementRateMin: 0,
  selectedRegions: [],
  verifiedOnly: false,
  selectedGenres: [],
  matchScore: 0
});

// Dropdown states
const isGenreDropdownOpen = ref(false);
const isPlatformDropdownOpen = ref(false);
const isRegionDropdownOpen = ref(false);

// Close dropdowns when clicking outside
const handleClickOutside = (event) => {
  const dropdowns = {
    genre: document.querySelector('.genre-dropdown'),
    platform: document.querySelector('.platform-dropdown'),
    region: document.querySelector('.region-dropdown')
  };
  
  const buttons = {
    genre: document.querySelector('.genre-dropdown-button'),
    platform: document.querySelector('.platform-dropdown-button'),
    region: document.querySelector('.region-dropdown-button')
  };

  // Check each dropdown
  if (dropdowns.genre && buttons.genre && 
      !dropdowns.genre.contains(event.target) && 
      !buttons.genre.contains(event.target)) {
    isGenreDropdownOpen.value = false;
  }
  
  if (dropdowns.platform && buttons.platform && 
      !dropdowns.platform.contains(event.target) && 
      !buttons.platform.contains(event.target)) {
    isPlatformDropdownOpen.value = false;
  }
  
  if (dropdowns.region && buttons.region && 
      !dropdowns.region.contains(event.target) && 
      !buttons.region.contains(event.target)) {
    isRegionDropdownOpen.value = false;
  }
};

// Add and remove click outside listener
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Watch for prop changes to update local state
watch(() => props.platforms, (newVal) => { localFilters.value.platforms = [...newVal] });
watch(() => props.categories, (newVal) => { localFilters.value.categories = [...newVal] });
watch(() => props.verifiedOnly, (newVal) => { localFilters.value.verifiedOnly = newVal });
watch(() => props.followerMin, (newVal) => { localFilters.value.followerMin = newVal });
watch(() => props.followerMax, (newVal) => { localFilters.value.followerMax = newVal });
watch(() => props.selectedGenres, (newVal) => { localFilters.value.selectedGenres = [...newVal] });
watch(() => props.selectedRegions, (newVal) => { localFilters.value.selectedRegions = [...newVal] });
watch(() => props.matchScore, (newVal) => { localFilters.value.matchScore = newVal });

// Available options
const platforms = [
  'YouTube',
  'TikTok',
  'Instagram',
  'Twitter',
  'Twitch'
];

const regions = [
  'US-West',
  'US-East',
  'US-Central',
  'US-South',
  'EU-Central',
  'EU-North',
  'EU-South', 
  'EU-West',
  'APAC'
];

const gameGenres = [
  'Battle Royale',
  'Casual',
  'Competitive',
  'Cozy',
  'Documentary',
  'Esports',
  'FPS',
  'Game Dev',
  'History',
  'Indie',
  'Just Chatting',
  'Life Sim',
  'Military Sim',
  'Mobile',
  'MOBA',
  'Multiplayer',
  'Open World',
  'Platformer',
  'Retro',
  'Review',
  'RPG',
  'Simulation',
  'Speedrun',
  'Story',
  'Strategy',
  'Tactical',
  'Variety',
  'VR'
];

// Computed properties for two-way binding
const minFollowers = computed({
  get: () => localFilters.value.followerMin,
  set: (value) => {
    localFilters.value.followerMin = value;
  }
});

const maxFollowers = computed({
  get: () => localFilters.value.followerMax,
  set: (value) => {
    localFilters.value.followerMax = value;
  }
});

const isVerified = computed({
  get: () => localFilters.value.verifiedOnly,
  set: (value) => {
    localFilters.value.verifiedOnly = value;
  }
});

const selectedGenresList = computed({
  get: () => localFilters.value.selectedGenres,
  set: (value) => {
    localFilters.value.selectedGenres = value;
    // Emit update event when selectedGenres changes
    emit('update:selectedGenres', value);
  }
});

const selectedRegionsList = computed({
  get: () => localFilters.value.selectedRegions,
  set: (value) => {
    localFilters.value.selectedRegions = value;
    // Emit update event when selectedRegions changes
    emit('update:selectedRegions', value);
  }
});

const selectedPlatformsList = computed({
  get: () => localFilters.value.platforms,
  set: (value) => {
    localFilters.value.platforms = value;
  }
});

const selectedCategoriesList = computed({
  get: () => localFilters.value.categories,
  set: (value) => {
    localFilters.value.categories = value;
  }
});

// Methods
const applyFilters = () => {
  // Debug log to see current selectedGenres value
  console.log('Current selectedGenres before applying filters:', localFilters.value.selectedGenres);
  
  const filterParams = {
    platforms: localFilters.value.platforms,
    categories: localFilters.value.categories,
    verifiedOnly: localFilters.value.verifiedOnly,
    followerRange: [localFilters.value.followerMin, localFilters.value.followerMax],
    genres: localFilters.value.selectedGenres,
    regions: localFilters.value.selectedRegions,
    matchScoreMin: parseInt(localFilters.value.matchScore) || 0
  };
  
  // Close all dropdowns
  isGenreDropdownOpen.value = false;
  isPlatformDropdownOpen.value = false;
  isRegionDropdownOpen.value = false;
  
  // Log the filter parameters being sent
  console.log('Applying filters with params:', filterParams);
  
  emit('filter-change', filterParams);
};

const resetFilters = () => {
  // Reset all local filter values
  localFilters.value = {
    platforms: [],
    categories: [],
    followerMin: 0,
    followerMax: 10000000,
    engagementRateMin: 0,
    selectedRegions: [],
    verifiedOnly: false,
    selectedGenres: [],
    matchScore: 0
  };

  // Close all dropdowns
  isGenreDropdownOpen.value = false;
  isPlatformDropdownOpen.value = false;
  isRegionDropdownOpen.value = false;

  // Update parent component values
  emit('update:platforms', []);
  emit('update:categories', []);
  emit('update:verifiedOnly', false);
  emit('update:followerMin', 0);
  emit('update:followerMax', 10000000);
  emit('update:selectedGenres', []);
  emit('update:selectedRegions', []);
  emit('update:matchScore', null);

  // Emit a custom event to tell parent to do a full reset
  emit('reset');
};

// Watch for match score changes
watch(() => localFilters.value.matchScore, (newVal) => {
  // Ensure the value is a number
  localFilters.value.matchScore = parseInt(newVal) || 0;
});

// Add computed property for match score
const matchScore = computed({
  get: () => localFilters.value.matchScore,
  set: (value) => {
    localFilters.value.matchScore = parseInt(value) || 0;
  }
});

// Add new method to emit match score update
const emitMatchScoreUpdate = () => {
  emit('update:matchScore', localFilters.value.matchScore);
  // Also apply the filters immediately when slider changes
  applyFilters();
};

// Add methods to emit follower range updates
const updateFollowerMin = () => {
  emit('update:followerMin', localFilters.value.followerMin);
  // Apply filters immediately
  applyFilters();
};

const updateFollowerMax = () => {
  emit('update:followerMax', localFilters.value.followerMax);
  // Apply filters immediately
  applyFilters();
};
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white shadow-sm">
    <div class="flex flex-col space-y-1.5 p-6">
      <h3 class="text-2xl font-semibold leading-none tracking-tight">Filters</h3>
    </div>
    
    <!-- Follower Count -->
    <div class="p-6">
      <h4 class="font-medium mb-2">Follower Count</h4>
      <div class="px-2">
        <div class="flex gap-4 mb-2">
          <div class="flex-1">
            <label class="text-sm">Min</label>
            <input 
              type="number" 
              v-model.number="minFollowers"
              min="0"
              max="1000000000"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple"
              @change="updateFollowerMin"
            >
          </div>
          <div class="flex-1">
            <label class="text-sm">Max</label>
            <input 
              type="number" 
              v-model.number="maxFollowers"
              min="0"
              max="1000000000"
              class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple"
              @change="updateFollowerMax"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Verified Only -->
    <div class="px-6 mb-6">
      <div class="flex items-center space-x-2">
        <h4 class="font-medium">Verified Only</h4>
        <input 
          type="checkbox"
          v-model="isVerified"
          class="w-4 h-4 text-brand-purple focus:ring-brand-purple rounded"
        >
      </div>
    </div>

    <!-- Target game genres -->
    <div class="px-6 mb-6">
      <h4 class="font-medium mb-2">Game Categories</h4>
      <div class="relative">
        <button 
          @click="isGenreDropdownOpen = !isGenreDropdownOpen"
          class="genre-dropdown-button w-full flex items-center justify-between px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <span>{{ selectedGenresList.length > 0 ? `${selectedGenresList.length} selected` : 'Select genres' }}</span>
          <svg 
            class="w-4 h-4 transition-transform" 
            :class="{ 'rotate-180': isGenreDropdownOpen }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <!-- Dropdown menu -->
        <div 
          v-if="isGenreDropdownOpen"
          class="genre-dropdown absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          <div class="p-2 space-y-1">
            <label 
              v-for="genre in gameGenres" 
              :key="genre"
              class="flex items-center px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer"
            >
              <input 
                type="checkbox"
                :value="genre"
                v-model="selectedGenresList"
                class="w-4 h-4 text-brand-purple focus:ring-brand-purple rounded"
              >
              <span class="ml-2 text-sm">{{ genre }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Match Score Filter -->
    <div class="px-6 mb-6">
      <div class="flex justify-between items-center mb-2">
        <h4 class="font-medium">Minimum Match Score</h4>
        <span class="text-sm font-medium text-blue-600">{{ localFilters.matchScore }}%</span>
      </div>
      <div class="relative">
        <input
          type="range"
          v-model="localFilters.matchScore"
          min="0"
          max="100"
          step="1"
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
          :style="{
            background: `linear-gradient(to right, #2563eb 0%, #2563eb ${localFilters.matchScore}%, #e5e7eb ${localFilters.matchScore}%, #e5e7eb 100%)`
          }"
          @input="emitMatchScoreUpdate"
        />
      </div>
    </div>

    <!-- Platforms -->
    <div class="px-6 mb-6">
      <h4 class="font-medium mb-2">Platform</h4>
      <div class="relative">
        <button 
          @click="isPlatformDropdownOpen = !isPlatformDropdownOpen"
          class="platform-dropdown-button w-full flex items-center justify-between px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <span>{{ selectedPlatformsList.length > 0 ? `${selectedPlatformsList.length} selected` : 'Select platforms' }}</span>
          <svg 
            class="w-4 h-4 transition-transform" 
            :class="{ 'rotate-180': isPlatformDropdownOpen }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <!-- Dropdown menu -->
        <div 
          v-if="isPlatformDropdownOpen"
          class="platform-dropdown absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          <div class="p-2 space-y-1">
            <label 
              v-for="platform in platforms" 
              :key="platform"
              class="flex items-center px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer"
            >
              <input 
                type="checkbox"
                :value="platform"
                v-model="selectedPlatformsList"
                class="w-4 h-4 text-brand-purple focus:ring-brand-purple rounded"
              >
              <span class="ml-2 text-sm">{{ platform }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Regions -->
    <div class="px-6 mb-6">
      <h4 class="font-medium mb-2">Regions</h4>
      <div class="relative">
        <button 
          @click="isRegionDropdownOpen = !isRegionDropdownOpen"
          class="region-dropdown-button w-full flex items-center justify-between px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <span>{{ selectedRegionsList.length > 0 ? `${selectedRegionsList.length} selected` : 'Select regions' }}</span>
          <svg 
            class="w-4 h-4 transition-transform" 
            :class="{ 'rotate-180': isRegionDropdownOpen }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <!-- Dropdown menu -->
        <div 
          v-if="isRegionDropdownOpen"
          class="region-dropdown absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          <div class="p-2 space-y-1">
            <label 
              v-for="region in regions" 
              :key="region"
              class="flex items-center px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer"
            >
              <input 
                type="checkbox"
                :value="region"
                v-model="selectedRegionsList"
                class="w-4 h-4 text-brand-purple focus:ring-brand-purple rounded"
              >
              <span class="ml-2 text-sm">{{ region }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="p-6 pt-0 flex gap-2">
      <button 
        @click="applyFilters"
        class="flex-1 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition"
      >
        Apply Filters
      </button>
      <button 
        @click="resetFilters"
        class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition"
      >
        Reset
      </button>
    </div>
  </div>
</template>

<style scoped>
.slider-thumb {
  -webkit-appearance: none;
  appearance: none;
}

.slider-thumb::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: white;
  border: 2px solid #2563eb;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: -7px;
}

.slider-thumb::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: white;
  border: 2px solid #2563eb;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transform: translateY(-50%);
}

.slider-thumb::-moz-range-track {
  height: 8px; 
  background: #e5e7eb;
  border-radius: 4px;
}

.slider-thumb::-webkit-slider-runnable-track {
  height: 8px;
  border-radius: 4px;
}
</style>