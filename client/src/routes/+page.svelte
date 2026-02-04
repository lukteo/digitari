<script lang="ts">
  import { goto } from '$app/navigation';
  import { writable } from 'svelte/store';

  // Store quiz answers
  let currentQuestion = 0;
  let userInitials = '';
  let quizAnswers: number[] = [];
  let initialsError = '';

  const questions = [
    {
      id: 1,
      question: "How do you prefer to spend your free time?",
      options: [
        { value: 1, text: "Relaxing at home with a book or movie" },
        { value: 2, text: "Going out with friends" },
        { value: 3, text: "Exploring new places or hobbies" },
        { value: 4, text: "Playing games or doing puzzles" },
        { value: 5, text: "Exercising or being active" }
      ]
    },
    {
      id: 2,
      question: "When meeting new people, you tend to be...",
      options: [
        { value: 1, text: "Very shy and reserved" },
        { value: 2, text: "A bit cautious at first" },
        { value: 3, text: "Friendly and open" },
        { value: 4, text: "Very outgoing and talkative" },
        { value: 5, text: "The life of the party" }
      ]
    },
    {
      id: 3,
      question: "How curious are you about trying new things?",
      options: [
        { value: 1, text: "I prefer sticking to what I know" },
        { value: 2, text: "I'll try new things if encouraged" },
        { value: 3, text: "I'm moderately adventurous" },
        { value: 4, text: "I love discovering new experiences" },
        { value: 5, text: "I seek out adventure constantly" }
      ]
    },
    {
      id: 4,
      question: "How do you show affection to those close to you?",
      options: [
        { value: 1, text: "I'm quite independent" },
        { value: 2, text: "Through actions more than words" },
        { value: 3, text: "A balance of space and closeness" },
        { value: 4, text: "I'm quite affectionate" },
        { value: 5, text: "Very loving and demonstrative" }
      ]
    },
    {
      id: 5,
      question: "When facing a challenge, you are...",
      options: [
        { value: 1, text: "Cautious and careful" },
        { value: 2, text: "Thoughtful and planned" },
        { value: 3, text: "Balanced and adaptable" },
        { value: 4, text: "Bold and determined" },
        { value: 5, text: "Fearless and persistent" }
      ]
    }
  ];

  function validateInitials(): boolean {
    if (!userInitials || userInitials.length < 1) {
      initialsError = 'Please enter at least one initial';
      return false;
    }
    if (userInitials.length > 3) {
      initialsError = 'Please enter no more than 3 initials';
      return false;
    }
    if (!/^[A-Za-z]+$/.test(userInitials)) {
      initialsError = 'Please use only letters';
      return false;
    }
    initialsError = '';
    return true;
  }

  function nextStep() {
    if (currentQuestion === 0) {
      if (!validateInitials()) return;
    }
    currentQuestion++;
  }

  function previousStep() {
    currentQuestion--;
  }

  function selectAnswer(value: number) {
    // Update answer for current question (array is 0-indexed, questions are 1-indexed)
    const questionIndex = currentQuestion - 1;
    quizAnswers[questionIndex] = value;

    // Auto-advance after selection
    setTimeout(() => {
      if (currentQuestion < questions.length) {
        nextStep();
      } else {
        submitQuiz();
      }
    }, 300);
  }

  async function submitQuiz() {
    // Navigate to generation page with data
    const queryParams = new URLSearchParams({
      initials: userInitials.toUpperCase(),
      answers: quizAnswers.join(',')
    });

    goto(`/generate?${queryParams.toString()}`);
  }

  $: progress = ((currentQuestion) / (questions.length + 1)) * 100;
</script>

<div class="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center p-4">
  <div class="w-full max-w-2xl">
    <!-- Progress bar -->
    <div class="mb-8">
      <div class="h-2 bg-white/30 rounded-full overflow-hidden">
        <div
          class="h-full bg-white transition-all duration-300 ease-out rounded-full"
          style="width: {progress}%"
        ></div>
      </div>
      <p class="text-white text-sm mt-2 text-center">
        Step {currentQuestion + 1} of {questions.length + 1}
      </p>
    </div>

    <!-- Card -->
    <div class="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
      {#if currentQuestion === 0}
        <!-- Initials Input -->
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-800 mb-4">
            Welcome, Trainer!
          </h1>
          <p class="text-gray-600 mb-8 text-lg">
            You're about to meet your lifelong companion. Let's start by getting to know you.
          </p>

          <div class="max-w-md mx-auto">
            <label for="initials" class="block text-left text-sm font-medium text-gray-700 mb-2">
              What are your initials?
            </label>
            <input
              id="initials"
              type="text"
              bind:value={userInitials}
              on:input={() => validateInitials()}
              maxlength="3"
              placeholder="e.g., JD"
              class="w-full px-6 py-4 text-2xl text-center font-bold uppercase border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all outline-none"
              class:border-red-500={initialsError}
            />
            {#if initialsError}
              <p class="text-red-500 text-sm mt-2">{initialsError}</p>
            {/if}
            <p class="text-gray-500 text-sm mt-2">
              These will help create your unique partner
            </p>
          </div>

          <button
            on:click={nextStep}
            disabled={!userInitials}
            class="mt-8 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Continue
          </button>
        </div>

      {:else if currentQuestion <= questions.length}
        <!-- Quiz Questions -->
        {@const question = questions[currentQuestion - 1]}
        {@const selectedAnswer = quizAnswers[currentQuestion - 1]}

        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
            {question.question}
          </h2>

          <div class="space-y-3">
            {#each question.options as option}
              <button
                on:click={() => selectAnswer(option.value)}
                class="w-full p-4 text-left rounded-xl border-2 transition-all hover:border-purple-400 hover:bg-purple-50"
                class:border-purple-500={selectedAnswer === option.value}
                class:bg-purple-100={selectedAnswer === option.value}
                class:border-gray-300={selectedAnswer !== option.value}
              >
                <span class="font-medium text-gray-800">{option.text}</span>
              </button>
            {/each}
          </div>

          <div class="flex gap-4 mt-8">
            <button
              on:click={previousStep}
              class="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
            >
              ← Back
            </button>

            {#if selectedAnswer}
              <button
                on:click={currentQuestion === questions.length ? submitQuiz : nextStep}
                class="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                {currentQuestion === questions.length ? 'Meet Your Partner! ✨' : 'Next →'}
              </button>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  /* Smooth animations */
  :global(body) {
    transition: background-color 0.3s ease;
  }
</style>
