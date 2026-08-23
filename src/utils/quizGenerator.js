// Random MCQ Quiz Generator from Birochon dataset

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const generateQuiz = (allData, config) => {
  const { category = 'all', count = 10, timeLimitMinutes = 10 } = config;

  let pool = [];
  let categoryMap = allData.items;

  if (category === 'all') {
    // combine items from all categories
    Object.keys(categoryMap).forEach(catKey => {
      pool = pool.concat(categoryMap[catKey]);
    });
  } else if (categoryMap[category]) {
    pool = [...categoryMap[category]];
  }

  if (pool.length === 0) {
    return { questions: [], timeLimitSeconds: timeLimitMinutes * 60 };
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

    return {
      id: `q_${idx + 1}_${item.id}`,
      originalItem: item,
      category: item.category,
      categoryName: item.categoryName,
      prompt,
      correctAnswer,
      options
    };
  });

  // Calculate time limit in seconds (1 minute per question default as per prompt)
  // E.g., count questions -> count minutes limit
  const timeLimitSeconds = (timeLimitMinutes || count) * 60;

  return {
    questions,
    timeLimitSeconds,
    categoryName: category === 'all' ? 'সকল বিষয়' : (allData.categories[category]?.name || 'বিবিধ')
  };
};
