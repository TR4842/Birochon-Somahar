// Random MCQ Quiz Generator from Birochon dataset
// Supports two generation modes:
//  - normal: from the full database (optionally filtered by category / letter)
//  - wrongOnly: from a pre-saved list of "wrong answer" items (re-practice)

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Build the actual displayed "meaning" string for a somarthok item.
// When BOTH synonym columns are present we show the union; if only one is
// present (the user's Excel sometimes has just 1 column for some rows) we
// fall back to that.
function getSomarthokMeaning(item) {
  const exam = (item.examSynonyms || '').trim();
  const extra = (item.extraSynonyms || '').trim();
  if (exam && extra) return `${exam}, ${extra}`;
  return exam || extra || (item.meaning || '').trim();
}

export const generateQuiz = (allData, config) => {
  const {
    category = 'all',
    count = 10,
    timeLimitMinutes = 10,
    letter = 'ALL',           // 'ALL' | a specific Bengali char like 'অ' or English like 'A'
    wrongPool = null          // when non-null, only these items are used
  } = config;

  let pool = [];
  let categoryMap = allData.items;

  if (wrongPool && Array.isArray(wrongPool) && wrongPool.length > 0) {
    // Re-practice mode: pool = saved wrong items directly
    pool = [...wrongPool];
  } else if (category === 'all') {
    Object.keys(categoryMap).forEach(catKey => {
      pool = pool.concat(categoryMap[catKey]);
    });
  } else if (categoryMap[category]) {
    pool = [...categoryMap[category]];
  }

  // Apply letter filter (case-insensitive startsWith)
  if (letter && letter !== 'ALL' && pool.length > 0) {
    const lower = letter.toLowerCase();
    const upper = letter.toUpperCase();
    pool = pool.filter(item => {
      const t = (item.term || '').trim();
      return t.startsWith(letter) || t.startsWith(lower) || t.startsWith(upper);
    });
  }

  if (pool.length === 0) {
    return {
      questions: [],
      timeLimitSeconds: timeLimitMinutes * 60,
      categoryName: category === 'all' ? 'সকল বিষয়' : (allData.categories[category]?.name || 'বিবিধ'),
      poolSize: 0
    };
  }

  // Shuffle pool and select 'count' items
  const selectedItems = shuffleArray(pool).slice(0, Math.min(count, pool.length));

  const questions = selectedItems.map((item, idx) => {
    const cat = item.category;
    let prompt = '';
    let correctAnswer = '';
    let distractorPool = [];

    if (cat === 'bagdhara') {
      prompt = `"${item.term}" বাগধারাটির সঠিক অর্থ কোনটি?`;
      correctAnswer = item.meaning;
      distractorPool = categoryMap.bagdhara.filter(i => i.id !== item.id).map(i => i.meaning);
    } else if (cat === 'biporit') {
      prompt = `"${item.term}" - এর সঠিক বিপরীত শব্দ কোনটি?`;
      correctAnswer = item.meaning;
      distractorPool = categoryMap.biporit.filter(i => i.id !== item.id).map(i => i.meaning);
    } else if (cat === 'paribhashik') {
      prompt = `"${item.term}" - এর বাংলা পারিভাষিক রূপ কোনটি?`;
      correctAnswer = item.meaning;
      distractorPool = categoryMap.paribhashik.filter(i => i.id !== item.id).map(i => i.meaning);
    } else if (cat === 'somarthok') {
      // We have two synonym columns now. Pool of candidates: every synonym
      // from every somarthok item (both examSynonyms & extraSynonyms).
      const correctFull = getSomarthokMeaning(item);
      const allSynonyms = correctFull.split(',').map(s => s.trim()).filter(Boolean);
      // Pick one random synonym as the "correct" answer for the MCQ, so the
      // question remains identical to before but the distractor pool is
      // automatically richer.
      const chosen = allSynonyms.length > 0
        ? allSynonyms[Math.floor(Math.random() * allSynonyms.length)]
        : correctFull;
      prompt = `"${item.term}" - এর সঠিক সমার্থক শব্দ কোনটি?`;
      correctAnswer = chosen;
      distractorPool = categoryMap.somarthok
        .filter(i => i.id !== item.id)
        .flatMap(i => {
          const a = (i.examSynonyms || '').split(',').map(s => s.trim()).filter(Boolean);
          const b = (i.extraSynonyms || '').split(',').map(s => s.trim()).filter(Boolean);
          return [...a, ...b];
        })
        .filter(s => s && !allSynonyms.includes(s) && s !== item.term);
    } else if (cat === 'ekkothay') {
      // 50% chance term -> meaning or meaning -> term
      if (Math.random() > 0.5) {
        prompt = `"${item.meaning}" - এর এককথায় প্রকাশ কোনটি?`;
        correctAnswer = item.term;
        distractorPool = categoryMap.ekkothay.filter(i => i.id !== item.id).map(i => i.term);
      } else {
        prompt = `"${item.term}" - এর সঠিক বাক্য সংকোচন / মূল বাক্য কোনটি?`;
        correctAnswer = item.meaning;
        distractorPool = categoryMap.ekkothay.filter(i => i.id !== item.id).map(i => i.meaning);
      }
    } else {
      prompt = `"${item.term}" - এর সঠিক উত্তর কোনটি?`;
      correctAnswer = item.meaning;
      distractorPool = pool.filter(i => i.id !== item.id).map(i => i.meaning);
    }

    // Pick 3 unique distractors
    const shuffledDistractors = shuffleArray(Array.from(new Set(distractorPool)));
    const selectedDistractors = shuffledDistractors.slice(0, 3);

    // Fallback if not enough unique distractors
    while (selectedDistractors.length < 3) {
      selectedDistractors.push(`বিকল্প উত্তর ${selectedDistractors.length + 1}`);
    }

    const options = shuffleArray([correctAnswer, ...selectedDistractors]);

    // For wrong-answer saving we need a stable id that survives quizzes.
    // The original `item.id` is stable across regenerations, so use that.
    return {
      id: `q_${item.id}_${idx}`,
      itemId: item.id,                    // stable across regenerations
      originalItem: item,                 // full item, useful for "save wrong" persistence
      category: item.category,
      categoryName: item.categoryName,
      prompt,
      correctAnswer,
      options
    };
  });

  // Calculate time limit in seconds (1 minute per question default as per prompt)
  const timeLimitSeconds = (timeLimitMinutes || count) * 60;

  const baseName = category === 'all' ? 'সকল বিষয়' : (allData.categories[category]?.name || 'বিবিধ');
  const letterSuffix = letter && letter !== 'ALL' ? ` (${letter}…)` : '';

  return {
    questions,
    timeLimitSeconds,
    categoryName: baseName + letterSuffix,
    poolSize: pool.length
  };
};
