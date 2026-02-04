<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  // Types
  interface Partner {
    id: string;
    dna_hash: string;
    name: string;
    visual_attributes: {
      species: string;
      color_primary: string;
      color_secondary: string;
      pattern: string;
    };
    personality: {
      energy: number;
      social: number;
      curiosity: number;
      affection: number;
    };
    stage: string;
    created_at: string;
  }

  // State
  let loading = true;
  let error = '';
  let partner: Partner | null = null;
  let partnerName = '';
  let nameError = '';
  let isNaming = false;

  // API configuration
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Get quiz data from URL
  const initials = $page.url.searchParams.get('initials') || '';
  const answersStr = $page.url.searchParams.get('answers') || '';
  const quizAnswers = answersStr.split(',').map(Number);

  onMount(async () => {
    // Validate we have quiz data
    if (!initials || quizAnswers.length !== 5) {
      error = 'Missing quiz data. Please start over.';
      loading = false;
      return;
    }

    // Generate partner
    await generatePartner();
  });

  async function generatePartner() {
    try {
      loading = true;
      error = '';

      // Call your Go backend
      const response = await fetch(`${API_BASE_URL}/api/partners/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include auth token if you have one stored
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          user_initials: initials,
          quiz_answers: quizAnswers
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate partner');
      }

      partner = await response.json();
      loading = false;

      // Animate the egg hatching
      setTimeout(() => {
        isNaming = true;
      }, 2000);

    } catch (err) {
      console.error('Generation error:', err);
      error = err instanceof Error ? err.message : 'Failed to generate partner';
      loading = false;
    }
  }

  function validateName(): boolean {
    if (!partnerName || partnerName.trim().length < 2) {
      nameError = 'Please enter at least 2 characters';
      return false;
    }
    if (partnerName.length > 20) {
      nameError = 'Name must be 20 characters or less';
      return false;
    }
    nameError = '';
    return true;
  }

  async function saveName() {
    if (!validateName() || !partner) return;

    try {
      // Update partner name in backend
      const response = await fetch(`${API_BASE_URL}/api/partners/${partner.id}/name`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: partnerName.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save name');
      }

      // Navigate to home/dashboard
      goto('/home');

    } catch (err) {
      console.error('Save name error:', err);
      nameError = 'Failed to save name. Please try again.';
    }
  }

  function getPersonalityDescription(personality: Partner['personality']): string {
    const traits = [];

    if (personality.energy > 60) traits.push('energetic');
    else if (personality.energy < 40) traits.push('calm');

    if (personality.social > 60) traits.push('friendly');
    else if (personality.social < 40) traits.push('shy');

    if (personality.curiosity > 60) traits.push('curious');
    else if (personality.curiosity < 40) traits.push('cautious');

    if (personality.affection > 60) traits.push('affectionate');
    else if (personality.affection < 40) traits.push('independent');

    return traits.join(', ') || 'balanced';
  }
</script>

<svelte:head>
  <title>Meet Your Partner | Virtual Pet</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
  <div class="w-full max-w-2xl">

    {#if loading}
      <!-- Loading State -->
      <div class="bg-white rounded-3xl shadow-2xl p-12 text-center">
        <div class="mb-8">
          <!-- Animated egg -->
          <div class="w-48 h-48 mx-auto bg-gradient-to-br from-purple-200 to-pink-200 rounded-full animate-bounce shadow-xl">
            <div class="w-full h-full flex items-center justify-center text-6xl">
              🥚
            </div>
          </div>
        </div>

        <h2 class="text-3xl font-bold text-gray-800 mb-4">
          Creating Your Partner...
        </h2>
        <p class="text-gray-600 text-lg">
          Something special is about to hatch! ✨
        </p>

        <!-- Loading spinner -->
        <div class="mt-8">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-purple-500"></div>
        </div>
      </div>

    {:else if error}
      <!-- Error State -->
      <div class="bg-white rounded-3xl shadow-2xl p-12 text-center">
        <div class="mb-6">
          <span class="text-6xl">😔</span>
        </div>
        <h2 class="text-3xl font-bold text-gray-800 mb-4">
          Oops! Something went wrong
        </h2>
        <p class="text-red-600 mb-8">{error}</p>
        <button
          on:click={() => goto('/')}
          class="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        >
          Start Over
        </button>
      </div>

    {:else if partner && !isNaming}
      <!-- Hatching Animation -->
      <div class="bg-white rounded-3xl shadow-2xl p-12 text-center">
        <div class="mb-8 animate-pulse">
          <!-- Hatching egg -->
          <div class="w-48 h-48 mx-auto relative">
            <div class="absolute inset-0 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full animate-wiggle shadow-xl">
              <div class="w-full h-full flex items-center justify-center text-6xl">
                🥚
              </div>
            </div>
            <!-- Cracks appearing -->
            <div class="absolute inset-0 flex items-center justify-center text-6xl animate-ping opacity-50">
              ✨
            </div>
          </div>
        </div>

        <h2 class="text-3xl font-bold text-gray-800 mb-4">
          It's hatching! 🎉
        </h2>
        <p class="text-gray-600 text-lg">
          Get ready to meet your new companion...
        </p>
      </div>

    {:else if partner && isNaming}
      <!-- Name Your Partner -->
      <div class="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
        <div class="text-center mb-8">
          <!-- Partner sprite/visual -->
          <div
            class="w-48 h-48 mx-auto rounded-full shadow-2xl mb-6 flex items-center justify-center text-8xl animate-float"
            style="background: linear-gradient(135deg, {partner.visual_attributes.color_primary}, {partner.visual_attributes.color_secondary})"
          >
            {#if partner.visual_attributes.species === 'Fluffy'}
              🐻
            {:else if partner.visual_attributes.species === 'Scaly'}
              🦎
            {:else if partner.visual_attributes.species === 'Feathered'}
              🦜
            {:else if partner.visual_attributes.species === 'Aquatic'}
              🐠
            {:else if partner.visual_attributes.species === 'Rocky'}
              🪨
            {:else}
              ✨
            {/if}
          </div>

          <h1 class="text-4xl font-bold text-gray-800 mb-4">
            Your Partner Has Arrived! 🎉
          </h1>
          <p class="text-gray-600 mb-2">
            A {getPersonalityDescription(partner.personality)} {partner.visual_attributes.species.toLowerCase()} companion
          </p>
        </div>

        <!-- Partner Details -->
        <div class="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 class="font-semibold text-gray-700 mb-4">Personality Traits</h3>
          <div class="space-y-3">
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span>Energy</span>
                <span class="font-semibold">{partner.personality.energy}</span>
              </div>
              <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all"
                  style="width: {partner.personality.energy}%"
                ></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-sm mb-1">
                <span>Social</span>
                <span class="font-semibold">{partner.personality.social}</span>
              </div>
              <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all"
                  style="width: {partner.personality.social}%"
                ></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-sm mb-1">
                <span>Curiosity</span>
                <span class="font-semibold">{partner.personality.curiosity}</span>
              </div>
              <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-green-400 to-teal-400 transition-all"
                  style="width: {partner.personality.curiosity}%"
                ></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-sm mb-1">
                <span>Affection</span>
                <span class="font-semibold">{partner.personality.affection}</span>
              </div>
              <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-pink-400 to-red-400 transition-all"
                  style="width: {partner.personality.affection}%"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Name Input -->
        <div class="mb-8">
          <label for="partnerName" class="block text-sm font-medium text-gray-700 mb-2">
            What will you name your partner?
          </label>
          <input
            id="partnerName"
            type="text"
            bind:value={partnerName}
            on:input={() => validateName()}
            maxlength="20"
            placeholder="Enter a name..."
            class="w-full px-6 py-4 text-xl font-semibold border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all outline-none"
            class:border-red-500={nameError}
          />
          {#if nameError}
            <p class="text-red-500 text-sm mt-2">{nameError}</p>
          {/if}
        </div>

        <button
          on:click={saveName}
          disabled={!partnerName || !!nameError}
          class="w-full px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          Begin Your Journey Together! →
        </button>

        <p class="text-center text-gray-500 text-sm mt-4">
          This bond is permanent and unique to you ✨
        </p>
      </div>
    {/if}
  </div>
</div>

<style>
  @keyframes wiggle {
    0%, 100% { transform: rotate(-3deg); }
    50% { transform: rotate(3deg); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }

  .animate-wiggle {
    animation: wiggle 0.5s ease-in-out infinite;
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
</style>
