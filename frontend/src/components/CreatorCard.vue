<script setup>
import { computed } from 'vue';

const props = defineProps({
  creator: {
    type: Object,
    required: true
  }
});

// Format large follower numbers (e.g. 1.2M, 345K)
const formattedFollowers = computed(() => {
  const followers = props.creator.followers;
  if (followers >= 1000000) {
    return (followers / 1000000).toFixed(1) + 'M';
  } else if (followers >= 1000) {
    return (followers / 1000).toFixed(1) + 'K';
  }
  return followers;
});

// Format engagement rate as percentage
const formattedEngagementRate = computed(() => {
  return props.creator.engagementRate.toFixed(1) + '%';
});

// Calculate match score bar width
const matchScoreWidth = computed(() => {
  return props.creator.matchScore === null ? '0%' : `${props.creator.matchScore}%`;
});

// Determine badge color based on match score
const matchScoreColor = computed(() => {
  if (props.creator.matchScore === null) return 'bg-gray-300';
  const score = props.creator.matchScore;
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-green-400';
  if (score >= 40) return 'bg-yellow-400';
  if (score >= 20) return 'bg-orange-400';
  return 'bg-red-400';
});

// Get match quality text and icon
const matchQuality = computed(() => {
  if (props.creator.matchScore === null) {
    return { text: 'No Campaign Selected', icon: 'fa-minus', class: 'text-gray-500' };
  }
  const score = props.creator.matchScore;
  if (score >= 80) return { text: 'Excellent Match', icon: 'fa-star', class: 'text-green-500' };
  if (score >= 60) return { text: 'Good Match', icon: 'fa-thumbs-up', class: 'text-green-400' };
  if (score >= 40) return { text: 'Fair Match', icon: 'fa-circle-check', class: 'text-yellow-400' };
  if (score >= 20) return { text: 'Poor Match', icon: 'fa-triangle-exclamation', class: 'text-orange-400' };
  return { text: 'Not Recommended', icon: 'fa-circle-xmark', class: 'text-red-400' };
});

// Generate tooltip text explaining match score
const matchScoreTooltip = computed(() => {
  if (props.creator.matchScore === null) {
    return 'Select a campaign objective to calculate match scores';
  }
  return `Match Score: ${props.creator.matchScore}%\n` +
         'Based on:\n' +
         '• Budget fit (25%)\n' +
         '• Content relevance (30%)\n' +
         '• Audience fit (20%)\n' +
         '• Engagement quality (15%)\n' +
         '• Previous performance (10%)';
});

// Generate platform icon class
const platformIcon = computed(() => {
  const platform = props.creator.platform?.toLowerCase();
  switch (platform) {
    case 'youtube': return 'fa-youtube text-red-600';
    case 'tiktok': return 'fa-tiktok text-black';
    case 'instagram': return 'fa-instagram text-purple-600';
    case 'twitter': return 'fa-twitter text-blue-400';
    case 'twitch': return 'fa-twitch text-purple-500';
    default: return 'fa-user text-gray-500';
  }
});

// Capitalize first letter of gender
const formattedGender = computed(() => {
  if (!props.creator.gender) return '';
  return props.creator.gender.charAt(0).toUpperCase() + props.creator.gender.slice(1);
});
</script>

<template>
  <div class="border rounded-2xl shadow bg-white overflow-hidden hover:shadow-md transition-shadow">
    <!-- Creator header (image, username, location, platform) -->
    <div class="p-4 border-b">
      <div class="flex items-center gap-3">
        <div class="h-12 w-12 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
          <img v-if="creator.profilePic" :src="creator.profilePic" alt="Profile" class="h-full w-full object-cover">
          <div v-else class="h-full w-full flex items-center justify-center bg-gray-300 text-gray-600">
            {{ creator.username?.charAt(0).toUpperCase() }}
          </div>
        </div>
        
        <div class="flex-grow">
          <div class="flex items-center">
            <h3 class="font-bold">{{ creator.username }}</h3>
            <span v-if="creator.verified" class="ml-1 text-blue-500">
              <i class="fas fa-check-circle"></i>
            </span>
          </div>
          
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <span>{{ creator.platform }}</span>
            <span class="text-gray-400">•</span>
            <span>{{ creator.location }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Match score section -->
    <div class="p-4 border-b">
      <div class="flex justify-between items-center mb-2">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium">Match Score</span>
        </div>
        <div class="flex items-center gap-2">
          <i :class="['fas', matchQuality.icon, matchQuality.class]"></i>
          <span :class="['font-bold text-lg', matchQuality.class]">
            {{ props.creator.matchScore === null ? '' : `${props.creator.matchScore}%` }}
          </span>
        </div>
      </div>
      <div class="relative">
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            :class="['h-2.5 rounded-full', matchScoreColor]" 
            :style="{ width: matchScoreWidth }"
          >
            <span class="sr-only">{{ props.creator.matchScore === null ? 'No match score' : `${props.creator.matchScore}% match score` }}</span>
          </div>
        </div>
        <div class="flex justify-between items-center mt-1">
          <span class="text-xs text-gray-500">{{ matchQuality.text }}</span>
        </div>
      </div>
    </div>
    
    <!-- Stats section -->
    <div class="p-4 grid grid-cols-3 gap-4 border-b">
      <div>
        <div class="text-sm text-gray-600">Followers</div>
        <div class="font-bold">{{ formattedFollowers }}</div>
      </div>
      <div>
        <div class="text-sm text-gray-600">Engagement</div>
        <div class="font-bold">{{ formattedEngagementRate }}</div>
      </div>
      <div>
        <div class="text-sm text-gray-600">Rate/hr</div>
        <div class="font-bold">${{ creator.hourlyRate }}</div>
      </div>
    </div>
    
    <!-- Categories section -->
    <div class="p-4">
      <div class="text-sm text-gray-600 mb-2">Categories</div>
      <div class="flex flex-wrap gap-1">
        <span 
          v-for="(category, index) in creator.contentCategories" 
          :key="index"
          class="px-2 py-1 bg-gray-100 text-xs rounded-full"
        >
          {{ category }}
        </span>
      </div>
    </div>
  </div>
</template>