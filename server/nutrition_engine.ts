export interface MealItem {
  name: string;
  portion: string;
  calories: number;
  glycemicIndex: 'Low' | 'Medium' | 'High';
  nutrientsHighlight: string;
  notes?: string;
}

export interface DailyMealPlan {
  day: number;
  dayName: string;
  breakfast: MealItem;
  morningSnack: MealItem;
  lunch: MealItem;
  eveningSnack: MealItem;
  dinner: MealItem;
  bedtimeSnack?: MealItem;
  dailyTotalCalories: number;
  keyTargetNutrients: string[];
}

export interface NutritionPlan {
  patientId: string;
  patientName: string;
  generatedAt: string;
  dailyCalorieTarget: number;
  macroDistribution: {
    carbsPercentage: number;
    carbsGrams: number;
    proteinPercentage: number;
    proteinGrams: number;
    fatPercentage: number;
    fatGrams: number;
  };
  dietaryPreference: 'vegetarian' | 'non-vegetarian' | 'vegan' | 'eggetarian';
  targetedRiskFocus: string[];
  keyGuidelines: {
    title: string;
    description: string;
    foodExamples: string[];
    foodsToAvoid: string[];
  }[];
  sevenDayMealPlan: DailyMealPlan[];
  doctorApprovalStatus: 'approved' | 'pending_review' | 'modified_by_clinician';
  doctorNotes?: string;
  approvedByDoctorId?: string;
}

export function generatePersonalizedNutritionPlan(params: {
  patientId: string;
  patientName: string;
  weightKg: number;
  heightCm: number;
  bmi: number;
  gestationalWeeks?: number;
  bloodSugarFasting: number;
  bloodSugarPostPrandial: number;
  hemoglobinG_dL: number;
  bloodPressureSys: number;
  gdmRiskLevel: 'Low' | 'Medium' | 'High';
  cervicalRiskLevel: 'Low' | 'Medium' | 'High';
  dietaryPreference?: 'vegetarian' | 'non-vegetarian' | 'vegan' | 'eggetarian';
  allergies?: string[];
}): NutritionPlan {
  const {
    patientId,
    patientName,
    weightKg = 62,
    heightCm = 160,
    bmi = 24.2,
    gestationalWeeks = 20,
    bloodSugarFasting = 92,
    bloodSugarPostPrandial = 118,
    hemoglobinG_dL = 11.2,
    gdmRiskLevel = 'Low',
    cervicalRiskLevel = 'Low',
    dietaryPreference = 'vegetarian',
  } = params;

  // Base BMR via Mifflin-St Jeor + Prenatal trimester adjustment
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * 28 - 161;
  let calorieTarget = Math.round(bmr * 1.35); // Light maternal activity

  // Trimester adjustments (ACOG / ICMR guidelines)
  if (gestationalWeeks > 13 && gestationalWeeks <= 26) {
    calorieTarget += 340; // 2nd trimester
  } else if (gestationalWeeks > 26) {
    calorieTarget += 450; // 3rd trimester
  }

  // Adjust for high BMI or high GDM risk
  if (bmi >= 30 || gdmRiskLevel === 'High') {
    calorieTarget = Math.max(1750, Math.min(calorieTarget, 2000));
  } else if (bmi < 19) {
    calorieTarget += 250;
  }

  // Macro allocation
  let carbsPct = 45;
  let proteinPct = 25;
  let fatPct = 30;

  if (gdmRiskLevel === 'High' || bloodSugarPostPrandial >= 130) {
    carbsPct = 40; // Controlled complex carbs with low GI
    proteinPct = 28;
    fatPct = 32;
  }

  const carbsGrams = Math.round((calorieTarget * (carbsPct / 100)) / 4);
  const proteinGrams = Math.round((calorieTarget * (proteinPct / 100)) / 4);
  const fatGrams = Math.round((calorieTarget * (fatPct / 100)) / 9);

  const targetedRiskFocus: string[] = [];
  if (gdmRiskLevel === 'High' || gdmRiskLevel === 'Medium' || bloodSugarFasting > 95) {
    targetedRiskFocus.push('Gestational Glycemic Control (Low-GI Protocol)');
  }
  if (hemoglobinG_dL < 11.0) {
    targetedRiskFocus.push('Maternal Anemia Prevention (Bioavailable Iron + Vit C)');
  }
  if (cervicalRiskLevel === 'High' || cervicalRiskLevel === 'Medium') {
    targetedRiskFocus.push('Antioxidant Cellular Protection (Folate, Lycopene, Carotenoids)');
  }
  targetedRiskFocus.push('Prenatal Fetal Neuro-Development (Folate, Iodine, Choline, DHA)');

  // Key Guidelines
  const keyGuidelines = [
    {
      title: 'Low Glycemic Index & Balanced Carbohydrates',
      description: 'Spread carbohydrates across 3 balanced meals and 2-3 small snacks to avoid maternal post-prandial glucose spikes.',
      foodExamples: ['Steel-cut oats', 'Quinoa', 'Brown basmati / Millets (Ragi, Foxtail)', 'Whole wheat chapati with multigrain bran', 'Chia & flaxseeds'],
      foodsToAvoid: ['Refined white sugar', 'Bakery pastries', 'White bread & refined maida', 'High-fructose sweetened juices', 'Deep-fried snacks'],
    },
    {
      title: 'High Bioavailable Iron & Vitamin C Pairing',
      description: 'Enhance non-heme iron absorption by pairing iron-rich foods with citrus/ascorbic acid. Avoid calcium supplements or tea within 1.5 hours of iron intake.',
      foodExamples: ['Steamed spinach & methi', 'Sprouted green moong dal', 'Pomegranate & beetroot', 'Lentils with freshly squeezed lemon juice', 'Toasted sesame & jaggery (sparingly)'],
      foodsToAvoid: ['Black tea or coffee with main meals', 'Calcium tablets taken alongside iron supplements', 'Phytate-heavy unsoaked grains'],
    },
    {
      title: 'Maternal Micronutrients: Folate, Choline & Antioxidants',
      description: 'Crucial for neural tube integrity, cervical cellular repair, and mucosal immunity against persistent viral infection.',
      foodExamples: dietaryPreference === 'vegan' 
        ? ['Dark leafy greens', 'Broccoli', 'Fortified soy/tofu', 'Avocados', 'Walnuts and almonds', 'Fresh amla']
        : ['Dark leafy greens', 'Broccoli', 'Eggs or fortified soy/paneer', 'Avocados', 'Walnuts and almonds', 'Fresh amla'],
      foodsToAvoid: ['Unpasteurized soft cheeses', 'Raw or undercooked seafood/poultry', 'Excessive vitamin A / liver supplements'],
    },
  ];

  // Meal Database
  const meals = {
    breakfast: {
      vegetarian: [
        { name: 'Vegetable Methi Ragi Porridge', portion: '1 bowl (250g)', calories: 320, glycemicIndex: 'Low', nutrientsHighlight: 'Iron, Fiber, Folate' },
        { name: 'Sprouted Moong Dal Chilla with Paneer', portion: '2 medium chillas', calories: 380, glycemicIndex: 'Low', nutrientsHighlight: 'Protein, Iron' },
        { name: 'Broken Wheat (Dalia) Upma with Peanuts', portion: '1.5 cups', calories: 350, glycemicIndex: 'Low', nutrientsHighlight: 'B-Vitamins, Fiber' },
        { name: 'Idli with Vegetable Sambhar', portion: '2 idlis + 1 bowl sambhar', calories: 340, glycemicIndex: 'Medium', nutrientsHighlight: 'Fermented B-Vitamins' },
        { name: 'Millet Poha with Mixed Veggies', portion: '1.5 cups', calories: 310, glycemicIndex: 'Medium', nutrientsHighlight: 'Carbs, Fiber' },
        { name: 'Oats with Almonds & Flaxseeds', portion: '1 bowl', calories: 360, glycemicIndex: 'Low', nutrientsHighlight: 'Omega-3, Fiber' },
        { name: 'Whole Wheat Pancakes with Berries', portion: '2 pancakes', calories: 330, glycemicIndex: 'Medium', nutrientsHighlight: 'Antioxidants' },
      ],
      'non-vegetarian': [
        { name: 'Vegetable Sprout Omelette (2 eggs)', portion: '1 large omelette', calories: 340, glycemicIndex: 'Low', nutrientsHighlight: 'Choline, Protein' },
        { name: 'Grilled Chicken Sausage with Sautéed Greens', portion: '2 sausages + 1 cup greens', calories: 360, glycemicIndex: 'Low', nutrientsHighlight: 'Protein, Zinc' },
        { name: 'Poached Eggs on Whole Wheat Toast', portion: '2 eggs + 1 slice toast', calories: 320, glycemicIndex: 'Low', nutrientsHighlight: 'Choline, B12' },
        { name: 'Smoked Salmon with Avocado on Rye', portion: '50g salmon + 1/2 avocado', calories: 380, glycemicIndex: 'Low', nutrientsHighlight: 'DHA, Healthy Fats' },
        { name: 'Boiled Egg Chaat with Chickpeas', portion: '2 eggs + 1/2 cup chickpeas', calories: 350, glycemicIndex: 'Low', nutrientsHighlight: 'Protein, Fiber' },
        { name: 'Scrambled Eggs with Spinach & Mushrooms', portion: '2 eggs + veggies', calories: 330, glycemicIndex: 'Low', nutrientsHighlight: 'Folate, Choline' },
        { name: 'Chicken Keema Paratha (Whole Wheat)', portion: '1 paratha', calories: 390, glycemicIndex: 'Medium', nutrientsHighlight: 'Protein, Iron' },
      ],
      vegan: [
        { name: 'Tofu Scramble with Turmeric & Spinach', portion: '1 cup scramble', calories: 310, glycemicIndex: 'Low', nutrientsHighlight: 'Plant Protein, Folate' },
        { name: 'Ragi Porridge with Almond Milk', portion: '1 bowl', calories: 300, glycemicIndex: 'Low', nutrientsHighlight: 'Calcium, Iron' },
        { name: 'Smoothie Bowl (Spinach, Banana, Hemp)', portion: '1 large bowl', calories: 350, glycemicIndex: 'Low', nutrientsHighlight: 'Folate, Healthy Fats' },
        { name: 'Buckwheat Pancakes with Chia Seeds', portion: '2 pancakes', calories: 320, glycemicIndex: 'Medium', nutrientsHighlight: 'Fiber, Magnesium' },
        { name: 'Quinoa Breakfast Bowl with Berries', portion: '1 bowl', calories: 340, glycemicIndex: 'Low', nutrientsHighlight: 'Complete Protein' },
        { name: 'Avocado Toast on Sprouted Grain Bread', portion: '2 slices', calories: 360, glycemicIndex: 'Low', nutrientsHighlight: 'Healthy Fats, Folate' },
        { name: 'Soy Yogurt with Crushed Walnuts', portion: '1 cup', calories: 280, glycemicIndex: 'Low', nutrientsHighlight: 'Omega-3, Protein' },
      ],
      eggetarian: [
        { name: 'Vegetable Sprout Omelette (2 eggs)', portion: '1 large omelette', calories: 340, glycemicIndex: 'Low', nutrientsHighlight: 'Choline, Protein' },
        { name: 'Sprouted Moong Dal Chilla with Egg', portion: '2 medium chillas', calories: 370, glycemicIndex: 'Low', nutrientsHighlight: 'Protein, Iron' },
        { name: 'Boiled Eggs with Steamed Veggies', portion: '2 eggs + 1 cup veggies', calories: 310, glycemicIndex: 'Low', nutrientsHighlight: 'Choline, Fiber' },
        { name: 'Egg Bhurji (Scrambled) with Whole Wheat Roti', portion: '2 eggs + 1 roti', calories: 360, glycemicIndex: 'Low', nutrientsHighlight: 'Protein, Choline' },
        { name: 'French Toast (Whole Wheat, no sugar)', portion: '2 slices', calories: 340, glycemicIndex: 'Medium', nutrientsHighlight: 'Protein, Carbs' },
        { name: 'Egg & Avocado Salad', portion: '1 bowl', calories: 330, glycemicIndex: 'Low', nutrientsHighlight: 'Healthy Fats, Choline' },
        { name: 'Oats with Egg Whites folded in', portion: '1 bowl', calories: 350, glycemicIndex: 'Low', nutrientsHighlight: 'Fiber, Protein' },
      ],
    },
    lunch: {
      vegetarian: [
        { name: 'Multi-Millet Khichdi with Mixed Veggies & Curd', portion: '1.5 cups', calories: 480, glycemicIndex: 'Low', nutrientsHighlight: 'Complex Carbs, Probiotics' },
        { name: 'Rajma (Kidney Bean) Curry with Brown Rice', portion: '1 cup rajma + 1 cup rice', calories: 520, glycemicIndex: 'Low', nutrientsHighlight: 'Fiber, Folate' },
        { name: 'Paneer Butter Masala (Low-fat) with Missi Roti', portion: '1 cup paneer + 1 roti', calories: 540, glycemicIndex: 'Medium', nutrientsHighlight: 'Protein, Calcium' },
        { name: 'Chickpea Salad with Tahini Dressing', portion: '2 cups salad', calories: 460, glycemicIndex: 'Low', nutrientsHighlight: 'Fiber, Plant Protein' },
        { name: 'Vegetable Biryani (Brown Rice) with Raita', portion: '1.5 cups biryani', calories: 510, glycemicIndex: 'Medium', nutrientsHighlight: 'Antioxidants' },
        { name: 'Palak Paneer with Jowar Bhakri', portion: '1 cup palak + 1 bhakri', calories: 490, glycemicIndex: 'Low', nutrientsHighlight: 'Iron, Calcium' },
        { name: 'Lentil Soup with Whole Wheat Wrap', portion: '1 bowl soup + 1 wrap', calories: 470, glycemicIndex: 'Low', nutrientsHighlight: 'Fiber, Folate' },
      ],
      'non-vegetarian': [
        { name: 'Grilled Chicken Breast with Quinoa & Steamed Broccoli', portion: '150g chicken + 1 cup quinoa', calories: 520, glycemicIndex: 'Low', nutrientsHighlight: 'Lean Protein, Zinc' },
        { name: 'Fish Curry with Steamed Brown Rice', portion: '150g fish + 1 cup rice', calories: 490, glycemicIndex: 'Low', nutrientsHighlight: 'DHA, Omega-3' },
        { name: 'Chicken Stew with Barley & Root Veggies', portion: '1.5 cups stew', calories: 510, glycemicIndex: 'Low', nutrientsHighlight: 'Protein, Fiber' },
        { name: 'Hard Boiled Egg Curry with Whole Wheat Roti', portion: '2 eggs + 2 rotis', calories: 480, glycemicIndex: 'Low', nutrientsHighlight: 'Choline, Protein' },
        { name: 'Turkey & Avocado Salad with Balsamic', portion: '2 cups salad', calories: 460, glycemicIndex: 'Low', nutrientsHighlight: 'Protein, Healthy Fats' },
        { name: 'Minced Chicken Stir-fry with Brown Rice', portion: '1 cup chicken + 1 cup rice', calories: 530, glycemicIndex: 'Low', nutrientsHighlight: 'Protein, Iron' },
        { name: 'Grilled Fish with Asparagus & Sweet Potato', portion: '150g fish + 1/2 sweet potato', calories: 500, glycemicIndex: 'Low', nutrientsHighlight: 'Omega-3, Vitamin A' },
      ],
      vegan: [
        { name: 'Quinoa Bowl with Roasted Chickpeas & Kale', portion: '2 cups', calories: 490, glycemicIndex: 'Low', nutrientsHighlight: 'Plant Protein, Fiber' },
        { name: 'Tofu stir-fry with Mixed Veggies & Brown Rice', portion: '150g tofu + 1 cup rice', calories: 510, glycemicIndex: 'Low', nutrientsHighlight: 'Plant Protein, Iron' },
        { name: 'Lentil Bolognese with Zucchini Noodles', portion: '2 cups', calories: 440, glycemicIndex: 'Low', nutrientsHighlight: 'Fiber, Lycopene' },
        { name: 'Sweet Potato & Black Bean Tacos (Corn)', portion: '2 tacos', calories: 470, glycemicIndex: 'Low', nutrientsHighlight: 'Fiber, Folate' },
        { name: 'Tempeh Salad with Peanut Dressing', portion: '2 cups salad', calories: 520, glycemicIndex: 'Low', nutrientsHighlight: 'Probiotics, Protein' },
        { name: 'Chana Masala with Jowar Bhakri', portion: '1 cup chana + 1 bhakri', calories: 480, glycemicIndex: 'Low', nutrientsHighlight: 'Iron, Fiber' },
        { name: 'Falafel Wrap with Hummus (Whole Wheat)', portion: '1 wrap', calories: 530, glycemicIndex: 'Medium', nutrientsHighlight: 'Plant Protein' },
      ],
      eggetarian: [
        { name: 'Egg Curry (2 eggs) with Brown Rice', portion: '1 cup curry + 1 cup rice', calories: 510, glycemicIndex: 'Low', nutrientsHighlight: 'Protein, Choline' },
        { name: 'Hard Boiled Egg Salad with Chickpeas', portion: '2 eggs + 1 cup chickpeas', calories: 480, glycemicIndex: 'Low', nutrientsHighlight: 'Protein, Fiber' },
        { name: 'Omelette Wrap (2 eggs) with Veggies', portion: '1 wrap', calories: 460, glycemicIndex: 'Low', nutrientsHighlight: 'Choline, Folate' },
        { name: 'Scrambled Eggs with Sautéed Spinach & Quinoa', portion: '2 eggs + 1 cup quinoa', calories: 520, glycemicIndex: 'Low', nutrientsHighlight: 'Protein, Iron' },
        { name: 'Egg Biryani (Brown Rice) with Raita', portion: '1.5 cups biryani', calories: 540, glycemicIndex: 'Medium', nutrientsHighlight: 'Protein, B12' },
        { name: 'Soft Boiled Eggs with Lentil Soup', portion: '2 eggs + 1 bowl soup', calories: 450, glycemicIndex: 'Low', nutrientsHighlight: 'Protein, Folate' },
        { name: 'Egg Florentine (No Hollandaise) with Whole Wheat Toast', portion: '2 eggs + spinach + 1 toast', calories: 490, glycemicIndex: 'Low', nutrientsHighlight: 'Choline, Iron' },
      ],
    },
    dinner: {
      vegetarian: [
        { name: 'Lentil Palak Curry with Jowar Roti', portion: '1.5 cups curry + 1 roti', calories: 460, glycemicIndex: 'Low', nutrientsHighlight: 'Iron, Fiber' },
        { name: 'Grilled Paneer with Steamed Broccoli & Carrots', portion: '150g paneer + 1 cup veggies', calories: 480, glycemicIndex: 'Low', nutrientsHighlight: 'Calcium, Protein' },
        { name: 'Hearty Tomato-Basil-Lentil Soup', portion: '1 large bowl', calories: 420, glycemicIndex: 'Low', nutrientsHighlight: 'Lycopene, Fiber' },
        { name: 'Vegetable Khichdi with Sprouted Dal', portion: '1.5 cups', calories: 450, glycemicIndex: 'Low', nutrientsHighlight: 'Easy Digestion, Protein' },
        { name: 'Mixed Veggie Sabzi with Bajra Roti', portion: '1 cup sabzi + 1 roti', calories: 440, glycemicIndex: 'Low', nutrientsHighlight: 'Minerals, Fiber' },
        { name: 'Baked Sweet Potato stuffed with Black Beans', portion: '1 medium potato', calories: 470, glycemicIndex: 'Low', nutrientsHighlight: 'Vitamin A, Fiber' },
        { name: 'Quinoa & Vegetable Stir-fry', portion: '1.5 cups', calories: 460, glycemicIndex: 'Low', nutrientsHighlight: 'Complete Protein' },
      ],
      'non-vegetarian': [
        { name: 'Baked Salmon with Asparagus & Quinoa', portion: '150g fish + 1 cup quinoa', calories: 510, glycemicIndex: 'Low', nutrientsHighlight: 'DHA, Omega-3' },
        { name: 'Steamed Chicken with Green Beans & Brown Rice', portion: '150g chicken + 1/2 cup rice', calories: 490, glycemicIndex: 'Low', nutrientsHighlight: 'Lean Protein, Zinc' },
        { name: 'Chicken & Vegetable Soup (Clear)', portion: '1 large bowl', calories: 440, glycemicIndex: 'Low', nutrientsHighlight: 'Protein, Hydration' },
        { name: 'Grilled Fish Skewers with Mixed Veggies', portion: '2 skewers', calories: 460, glycemicIndex: 'Low', nutrientsHighlight: 'Omega-3, Vitamins' },
        { name: 'Lemon Herb Chicken with Sautéed Spinach', portion: '150g chicken', calories: 450, glycemicIndex: 'Low', nutrientsHighlight: 'Protein, Iron' },
        { name: 'Turkey Meatballs with Zucchini Noodles', portion: '5 meatballs + 1.5 cups zoodles', calories: 480, glycemicIndex: 'Low', nutrientsHighlight: 'Protein, Low Carb' },
        { name: 'Baked Sea Bass with Roasted Cauliflower', portion: '150g fish', calories: 470, glycemicIndex: 'Low', nutrientsHighlight: 'Omega-3, Minerals' },
      ],
      vegan: [
        { name: 'Tofu & Vegetable Stir-fry (no oil)', portion: '1.5 cups', calories: 430, glycemicIndex: 'Low', nutrientsHighlight: 'Plant Protein, Fiber' },
        { name: 'Red Lentil Dal with Steamed Kale & Quinoa', portion: '1 cup dal + 1 cup quinoa', calories: 480, glycemicIndex: 'Low', nutrientsHighlight: 'Iron, Protein' },
        { name: 'Chickpea & Spinach Stew', portion: '1.5 cups', calories: 450, glycemicIndex: 'Low', nutrientsHighlight: 'Fiber, Folate' },
        { name: 'Tempeh Steaks with Roasted Brussels Sprouts', portion: '150g tempeh', calories: 490, glycemicIndex: 'Low', nutrientsHighlight: 'Probiotics, Protein' },
        { name: 'Stuffed Bell Peppers with Quinoa & Walnuts', portion: '2 peppers', calories: 460, glycemicIndex: 'Low', nutrientsHighlight: 'Antioxidants, Omega-3' },
        { name: 'Mushroom & Lentil Shepherd\'s Pie (Vegan)', portion: '1.5 cups', calories: 510, glycemicIndex: 'Medium', nutrientsHighlight: 'Fiber, Iron' },
        { name: 'Butternut Squash Soup with Pumpkin Seeds', portion: '1 large bowl', calories: 410, glycemicIndex: 'Low', nutrientsHighlight: 'Vitamin A, Zinc' },
      ],
      eggetarian: [
        { name: 'Poached Egg on Bed of Sauteed Spinach & Mushrooms', portion: '2 eggs + veggies', calories: 440, glycemicIndex: 'Low', nutrientsHighlight: 'Choline, Folate' },
        { name: 'Egg Bhurji (Scrambled) with 1 Whole Wheat Roti', portion: '2 eggs + 1 roti', calories: 460, glycemicIndex: 'Low', nutrientsHighlight: 'Protein, Choline' },
        { name: 'Hard Boiled Eggs in Tomato-Lentil Stew', portion: '2 eggs + 1 bowl stew', calories: 480, glycemicIndex: 'Low', nutrientsHighlight: 'Protein, Lycopene' },
        { name: 'Egg White Omelette with Mixed Veggies', portion: '3 egg whites + veggies', calories: 410, glycemicIndex: 'Low', nutrientsHighlight: 'Protein, Fiber' },
        { name: 'Soft Boiled Eggs with Quinoa Salad', portion: '2 eggs + 1 cup salad', calories: 490, glycemicIndex: 'Low', nutrientsHighlight: 'Protein, Fiber' },
        { name: 'Frittata (Egg & Vegetable) Bake', portion: '1 slice (1/4th of 9")', calories: 450, glycemicIndex: 'Low', nutrientsHighlight: 'Choline, Vitamins' },
        { name: 'Boiled Eggs with Roasted Asparagus & Carrots', portion: '2 eggs + 1 cup veggies', calories: 430, glycemicIndex: 'Low', nutrientsHighlight: 'Protein, Vitamins' },
      ],
    },
    snacks: [
      { name: 'Soaked Walnuts & Almonds', calories: 150, glycemicIndex: 'Low', nutrientsHighlight: 'Omega-3' },
      { name: 'Fresh Pomegranate Seeds', calories: 120, glycemicIndex: 'Low', nutrientsHighlight: 'Antioxidants' },
      { name: 'Roasted Chana (Bengal Gram)', calories: 160, glycemicIndex: 'Low', nutrientsHighlight: 'Protein' },
      { name: 'Spiced Buttermilk', calories: 80, glycemicIndex: 'Low', nutrientsHighlight: 'Probiotics' },
      { name: 'Apple slices with Peanut Butter', calories: 180, glycemicIndex: 'Low', nutrientsHighlight: 'Fiber' },
      { name: 'Greek Yogurt with Cinnamon', calories: 140, glycemicIndex: 'Low', nutrientsHighlight: 'Calcium' },
      { name: 'Roasted Pumpkin Seeds', calories: 130, glycemicIndex: 'Low', nutrientsHighlight: 'Zinc' },
      { name: 'Fresh Guava or Amla', calories: 90, glycemicIndex: 'Low', nutrientsHighlight: 'Vitamin C' },
      { name: 'Hummus with Carrot sticks', calories: 170, glycemicIndex: 'Low', nutrientsHighlight: 'Plant Protein' },
      { name: 'Warm Almond Milk (Bedtime)', calories: 90, glycemicIndex: 'Low', nutrientsHighlight: 'Magnesium' },
    ]
  };

  // Helper to shuffle or select meals
  const getMeal = (type: keyof typeof meals, index: number): MealItem => {
    const pref = dietaryPreference as keyof (typeof meals)['breakfast'];
    if (type === 'snacks') {
      const snackIdx = index % meals.snacks.length;
      return { ...meals.snacks[snackIdx], portion: '1 serving' } as MealItem;
    }
    const mealList = (meals[type] as any)[pref] || (meals[type] as any)['vegetarian'];
    const mealIdx = index % mealList.length;
    return mealList[mealIdx];
  };

  // 7-day meal plan construction
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const sampleDays: DailyMealPlan[] = dayNames.map((name, i) => {
    const breakfast = getMeal('breakfast', i);
    const morningSnack = getMeal('snacks', i);
    const lunch = getMeal('lunch', i);
    const eveningSnack = getMeal('snacks', i + 3);
    const dinner = getMeal('dinner', i);
    const bedtimeSnack = getMeal('snacks', 9); // Always warm milk

    const totalCals = breakfast.calories + morningSnack.calories + lunch.calories + eveningSnack.calories + dinner.calories + bedtimeSnack.calories;

    return {
      day: i + 1,
      dayName: `${name} (${targetedRiskFocus[0] || 'Balanced Nutrition'})`,
      breakfast,
      morningSnack,
      lunch,
      eveningSnack,
      dinner,
      bedtimeSnack,
      dailyTotalCalories: totalCals,
      keyTargetNutrients: targetedRiskFocus.slice(0, 3),
    };
  });

  return {
    patientId,
    patientName,
    generatedAt: new Date().toISOString(),
    dailyCalorieTarget: calorieTarget,
    macroDistribution: {
      carbsPercentage: carbsPct,
      carbsGrams,
      proteinPercentage: proteinPct,
      proteinGrams,
      fatPercentage: fatPct,
      fatGrams,
    },
    dietaryPreference,
    targetedRiskFocus,
    keyGuidelines,
    sevenDayMealPlan: sampleDays,
    doctorApprovalStatus: gdmRiskLevel === 'High' ? 'pending_review' : 'approved',
    doctorNotes: gdmRiskLevel === 'High'
      ? 'Attention Clinician: Maternal blood sugar shows elevated glycemic trend. Please review carbohydrate distribution and reinforce 2-hour post-prandial glucose testing.'
      : 'Nutritional plan tailored for optimal prenatal metabolic balance and cellular mucosal defense.',
  };
}
