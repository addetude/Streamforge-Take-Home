<script setup>
import { ref, computed, watch } from 'vue';

const emit = defineEmits(['settings-change']);

const budgetMin = ref(100);
const budgetMax = ref(500);
const selectedGenres = ref([]);
const targetAgeGroups = ref([]);
const targetGenders = ref([]);
const campaignObjective = ref('brand_awareness');

// Dropdown states
const showGenresDropdown = ref(false);
const showAgeGroupsDropdown = ref(false);
const showGendersDropdown = ref(false);

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

const ageGroups = [
  '18-24',
  '25-34',
  '35+'
];

const genders = [
  'male',
  'female',
  'other'
];

const objectives = [
  { value: 'brand_awareness', label: 'Brand Awareness' },
  { value: 'product_launch', label: 'Product Launch' },
  { value: 'community_engagement', label: 'Community Engagement' },
  { value: 'conversion', label: 'Conversions & Sales' }
];

// Computed properties for display text
const selectedGenresText = computed(() => {
  if (selectedGenres.value.length === 0) return 'Select genres';
  if (selectedGenres.value.length === 1) return selectedGenres.value[0];
  return `${selectedGenres.value.length} genres selected`;
});

const selectedAgeGroupsText = computed(() => {
  if (targetAgeGroups.value.length === 0) return 'Select age groups';
  if (targetAgeGroups.value.length === 1) return targetAgeGroups.value[0];
  return `${targetAgeGroups.value.length} age groups selected`;
});

const selectedGendersText = computed(() => {
  if (targetGenders.value.length === 0) return 'Select genders';
  if (targetGenders.value.length === 1) return targetGenders.value[0];
  return `${targetGenders.value.length} genders selected`;
});

// State
const campaignSettings = ref({
  budget: [budgetMin.value, budgetMax.value],
  targetGenres: selectedGenres.value,
  targetAgeGroups: targetAgeGroups.value,
  targetGenders: targetGenders.value,
  campaignObjective: campaignObjective.value
});

const formErrors = ref({
  campaignObjective: false,
  targetGenres: false,
  targetAgeGroups: false,
  targetGenders: false,
  budget: false
});

// Watch for changes in the original refs and update campaignSettings
watch(budgetMin, (newVal) => {
  campaignSettings.value.budget[0] = newVal;
});

watch(budgetMax, (newVal) => {
  campaignSettings.value.budget[1] = newVal;
});

watch(selectedGenres, (newVal) => {
  campaignSettings.value.targetGenres = newVal;
});

watch(targetAgeGroups, (newVal) => {
  campaignSettings.value.targetAgeGroups = newVal;
});

watch(targetGenders, (newVal) => {
  campaignSettings.value.targetGenders = newVal;
});

watch(campaignObjective, (newVal) => {
  campaignSettings.value.campaignObjective = newVal;
});

// Methods
function validateForm() {
  formErrors.value = {
    campaignObjective: !campaignSettings.value.campaignObjective,
    targetGenres: campaignSettings.value.targetGenres.length === 0,
    targetAgeGroups: campaignSettings.value.targetAgeGroups.length === 0,
    targetGenders: campaignSettings.value.targetGenders.length === 0,
    budget: !campaignSettings.value.budget || campaignSettings.value.budget.length !== 2
  };
  
  return !Object.values(formErrors.value).some(error => error);
}

function applySettings() {
  if (!validateForm()) {
    return;
  }
  
  emit('settings-change', {
    budget: [budgetMin.value, budgetMax.value],
    targetGenres: selectedGenres.value,
    targetAgeGroups: targetAgeGroups.value,
    targetGenders: targetGenders.value,
    campaignObjective: campaignObjective.value
  });
}

// Toggle dropdowns
function toggleDropdown(dropdown) {
  if (dropdown === 'genres') showGenresDropdown.value = !showGenresDropdown.value;
  if (dropdown === 'ageGroups') showAgeGroupsDropdown.value = !showAgeGroupsDropdown.value;
  if (dropdown === 'genders') showGendersDropdown.value = !showGendersDropdown.value;
}

// Close dropdowns when clicking outside
function closeDropdowns() {
  showGenresDropdown.value = false;
  showAgeGroupsDropdown.value = false;
  showGendersDropdown.value = false;
}

// Handle checkbox changes
function toggleGenre(genre) {
  const index = selectedGenres.value.indexOf(genre);
  if (index === -1) {
    selectedGenres.value.push(genre);
  } else {
    selectedGenres.value.splice(index, 1);
  }
}

function toggleAgeGroup(ageGroup) {
  const index = targetAgeGroups.value.indexOf(ageGroup);
  if (index === -1) {
    targetAgeGroups.value.push(ageGroup);
  } else {
    targetAgeGroups.value.splice(index, 1);
  }
}

function toggleGender(gender) {
  const index = targetGenders.value.indexOf(gender);
  if (index === -1) {
    targetGenders.value.push(gender);
  } else {
    targetGenders.value.splice(index, 1);
  }
}
</script>

<template>
  <div class="bg-white rounded-lg shadow p-4">
    <div class="flex flex-col">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Campaign Settings</h3>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <!-- Budget Range -->
        <div class="lg:col-span-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">Budget Range ($) <span class="text-red-500">*</span></label>
          <div class="flex items-center gap-2">
            <input
              type="number"
              v-model.number="budgetMin"
              class="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder="Min"
              required
            />
            <span class="text-gray-500">to</span>
            <input
              type="number"
              v-model.number="budgetMax"
              class="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder="Max"
              required
            />
          </div>
          <p v-if="formErrors.budget" class="text-red-500 text-xs mt-1">Please set a valid budget range</p>
        </div>

        <!-- Campaign Objective -->
        <div class="lg:col-span-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">Campaign Objective <span class="text-red-500">*</span></label>
          <select
            v-model="campaignObjective"
            class="w-48 border border-gray-300 rounded px-2 py-1 text-sm"
            required
          >
            <option v-for="objective in objectives" :key="objective.value" :value="objective.value">
              {{ objective.label }}
            </option>
          </select>
          <p v-if="formErrors.campaignObjective" class="text-red-500 text-xs mt-1">Please select a campaign objective</p>
        </div>

        <!-- Target Genres -->
        <div class="lg:col-span-1 relative">
          <label class="block text-sm font-medium text-gray-700 mb-1">Target Genres <span class="text-red-500">*</span></label>
          <button
            @click="toggleDropdown('genres')"
            class="w-48 border border-gray-300 rounded px-2 py-1 text-sm text-left flex items-center justify-between"
          >
            <span class="truncate">{{ selectedGenresText }}</span>
            <i class="fas fa-chevron-down text-xs flex-shrink-0"></i>
          </button>
          <div
            v-if="showGenresDropdown"
            class="absolute z-10 w-48 mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto"
          >
            <div class="p-2">
              <label 
                v-for="genre in gameGenres" 
                :key="genre"
                class="flex items-center space-x-2 p-1 hover:bg-gray-100 rounded cursor-pointer"
              >
                <input 
                  type="checkbox"
                  :checked="selectedGenres.includes(genre)"
                  @change="toggleGenre(genre)"
                  class="rounded border-gray-300 text-brand-purple focus:ring-brand-purple"
                  required
                />
                <span class="truncate">{{ genre }}</span>
              </label>
            </div>
          </div>
          <p v-if="formErrors.targetGenres" class="text-red-500 text-xs mt-1">Please select at least one genre</p>
        </div>

        <!-- Target Age Groups -->
        <div class="lg:col-span-1 relative">
          <label class="block text-sm font-medium text-gray-700 mb-1">Target Age Groups <span class="text-red-500">*</span></label>
          <button
            @click="toggleDropdown('ageGroups')"
            class="w-48 border border-gray-300 rounded px-2 py-1 text-sm text-left flex items-center justify-between"
          >
            <span class="truncate">{{ selectedAgeGroupsText }}</span>
            <i class="fas fa-chevron-down text-xs flex-shrink-0"></i>
          </button>
          <div
            v-if="showAgeGroupsDropdown"
            class="absolute z-10 w-48 mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto"
          >
            <div class="p-2">
              <label 
                v-for="ageGroup in ageGroups" 
                :key="ageGroup"
                class="flex items-center space-x-2 p-1 hover:bg-gray-100 rounded cursor-pointer"
              >
                <input 
                  type="checkbox"
                  :checked="targetAgeGroups.includes(ageGroup)"
                  @change="toggleAgeGroup(ageGroup)"
                  class="rounded border-gray-300 text-brand-purple focus:ring-brand-purple"
                  required
                />
                <span class="truncate">{{ ageGroup }}</span>
              </label>
            </div>
          </div>
          <p v-if="formErrors.targetAgeGroups" class="text-red-500 text-xs mt-1">Please select at least one age group</p>
        </div>

        <!-- Target Genders -->
        <div class="lg:col-span-1 relative">
          <label class="block text-sm font-medium text-gray-700 mb-1">Target Genders <span class="text-red-500">*</span></label>
          <button
            @click="toggleDropdown('genders')"
            class="w-48 border border-gray-300 rounded px-2 py-1 text-sm text-left flex items-center justify-between"
          >
            <span class="truncate">{{ selectedGendersText }}</span>
            <i class="fas fa-chevron-down text-xs flex-shrink-0"></i>
          </button>
          <div
            v-if="showGendersDropdown"
            class="absolute z-10 w-48 mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto"
          >
            <div class="p-2">
              <label 
                v-for="gender in genders" 
                :key="gender"
                class="flex items-center space-x-2 p-1 hover:bg-gray-100 rounded cursor-pointer"
              >
                <input 
                  type="checkbox"
                  :checked="targetGenders.includes(gender)"
                  @change="toggleGender(gender)"
                  class="rounded border-gray-300 text-brand-purple focus:ring-brand-purple"
                  required
                />
                <span class="truncate">{{ gender }}</span>
              </label>
            </div>
          </div>
          <p v-if="formErrors.targetGenders" class="text-red-500 text-xs mt-1">Please select at least one gender</p>
        </div>

        <!-- Apply Button -->
        <div class="lg:col-span-1 flex items-end">
          <button 
            @click="applySettings"
            class="w-full bg-black px-6 py-2 text-white rounded hover:bg-brand-purple-dark transition whitespace-nowrap"
          >
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add click-outside behavior */
@click-outside="closeDropdowns"
</style>