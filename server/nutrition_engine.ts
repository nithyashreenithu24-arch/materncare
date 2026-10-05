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
      foodExamples: ['Dark leafy greens', 'Broccoli', 'Eggs or fortified soy/paneer', 'Avocados', 'Walnuts and almonds', 'Fresh amla (Indian gooseberry)'],
      foodsToAvoid: ['Unpasteurized soft cheeses', 'Raw or undercooked seafood/poultry', 'Excessive vitamin A / liver supplements'],
    },
    {
      title: 'Adequate Hydration & Electrolytes',
      description: 'Maintain amniotic fluid index and renal clearance with 2.5 to 3.2 liters of safe fluids daily.',
      foodExamples: ['Fresh tender coconut water', 'Cumin (Jeera) infused water', 'Buttermilk with curry leaves', 'Fresh mint lemon water without sugar'],
      foodsToAvoid: ['Artificially sweetened diet sodas', 'High caffeine (>200mg/day)', 'Commercial energy drinks'],
    },
  ];

  // 7-day meal plan
  const isVeg = dietaryPreference === 'vegetarian' || dietaryPreference === 'vegan';
  const proteinMain = isVeg ? 'Grilled Tofu / Low-fat Paneer / Moong Sprouts' : 'Steamed Organic Chicken / Wild Salmon / Egg Whites';

  const sampleDays: DailyMealPlan[] = [
    {
      day: 1,
      dayName: 'Monday (Glycemic Stability & Iron Kickstart)',
      breakfast: {
        name: 'Vegetable Methi Ragi Porridge or Vegetable Sprout Omelette',
        portion: '1 medium bowl (250g) + 1 boiled egg or tofu cubes',
        calories: 360,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'Iron (4.5mg), Dietary Fiber (8g), Folate (120mcg)',
        notes: 'Pair with warm lemon water 20 min prior',
      },
      morningSnack: {
        name: 'Soaked Walnuts (4 halves) + Pomegranate Seeds',
        portion: '1 small bowl (80g)',
        calories: 160,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'Omega-3 ALA, Anthocyanins, Vitamin C',
      },
      lunch: {
        name: 'Brown Rice / Multi-Millet Khichdi with Mixed Veggies + Thick Dal Tadka',
        portion: '1.5 cups khichdi + 1 cup spinach cucumber salad',
        calories: 520,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'Plant protein (22g), Slow-release complex carbs',
        notes: 'Drizzle with 1 tsp cold-pressed sesame or olive oil',
      },
      eveningSnack: {
        name: 'Roasted Chana (Bengal Gram) + Fresh Spiced Buttermilk',
        portion: '40g roasted chana + 200ml spiced chaas',
        calories: 180,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'Calcium (240mg), Probiotics, Protein (9g)',
      },
      dinner: {
        name: `${proteinMain} with Steamed Broccoli, French Beans & 2 Multigrain Rotis`,
        portion: '150g protein source + 1 cup sauteed green vegetables',
        calories: 480,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'Zinc, Vitamin B12, High satiety',
        notes: 'Keep dinner 2.5 hours before sleeping to stabilize fasting blood sugar',
      },
      bedtimeSnack: {
        name: 'Warm Nutmeg Spiced Almond Milk',
        portion: '150ml unsweetened almond/low-fat milk',
        calories: 90,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'Magnesium, Tryptophan for restful maternal sleep',
      },
      dailyTotalCalories: 1790,
      keyTargetNutrients: ['Iron: 27mg target', 'Folate: 600mcg', 'Calcium: 1000mg', 'Fiber: 34g'],
    },
    {
      day: 2,
      dayName: 'Tuesday (Antioxidant & Cellular Defense Focus)',
      breakfast: {
        name: 'Steel-Cut Oats with Chia Seeds, Crushed Almonds & Fresh Blueberries',
        portion: '1 bowl (60g dry oats cooked in water/milk)',
        calories: 380,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'Beta-glucan soluble fiber, Vitamin E, Antioxidants',
      },
      morningSnack: {
        name: 'Roasted Pumpkin & Sunflower Seeds + Fresh Papaya / Guava slice',
        portion: '2 tbsp mixed seeds + 1/2 fresh guava (rich in Vit C)',
        calories: 140,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'Zinc (3mg), Vitamin C (120% RDA)',
      },
      lunch: {
        name: 'Quinoa Bowl with Roasted Chickpeas, Avocado, Baby Spinach & Tahini Dressing',
        portion: '1 large nutrient bowl (350g)',
        calories: 540,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'Complete amino acid profile (19g protein), Folate',
      },
      eveningSnack: {
        name: 'Steamed Edamame Pods with Sea Salt or Boiled Sweet Corn with Lemon',
        portion: '1 cup',
        calories: 170,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'Natural plant choline, dietary fiber',
      },
      dinner: {
        name: 'Lentil Palak Curry with Steamed Wild Rice / Jowar (Sorghum) Bhakri',
        portion: '1.5 cups thick curry + 1 jowar roti',
        calories: 460,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'Bioavailable non-heme iron, Potassium, Low GI',
      },
      dailyTotalCalories: 1780,
      keyTargetNutrients: ['Lycopene & Carotenoids', 'Choline: 450mg', 'Potassium: 3200mg'],
    },
    {
      day: 3,
      dayName: 'Wednesday (Post-Prandial Glycemic Control Protocol)',
      breakfast: {
        name: 'Sprouted Moong Dal Chilla (Pancake) stuffed with Grated Paneer & Herbs',
        portion: '2 medium chillas + mint coriander chutney',
        calories: 390,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'Protein (24g), Zero refined flour, Low GI',
      },
      morningSnack: {
        name: 'Greek Yogurt with Cinnamon Dust & Ground Flaxseed',
        portion: '150g unflavored greek yogurt',
        calories: 150,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'Cinnamon aids insulin sensitivity, Calcium (220mg)',
      },
      lunch: {
        name: 'Stir-fried Green Beans, Bell Peppers & Mushroom with Brown Rice',
        portion: '1 cup cooked brown rice + 1.5 cup vegetable tofu stir-fry',
        calories: 510,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'Chromium, B-complex vitamins, Antioxidants',
      },
      eveningSnack: {
        name: 'Makhana (Fox Nuts) dry roasted with Turmeric & Olive Oil',
        portion: '35g roasted fox nuts',
        calories: 140,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'Low sodium, High magnesium, Renal protective',
      },
      dinner: {
        name: 'Hearty Tomato-Basil-Lentil Soup + Grilled Veggie & Hummus Wrap',
        portion: '1 large bowl soup + 1 small whole-wheat wrap',
        calories: 490,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'Lycopene (cellular protective), Plant protein',
      },
      dailyTotalCalories: 1770,
      keyTargetNutrients: ['Fiber: 36g', 'Chromium', 'Vitamin C: 110mg'],
    },
    {
      day: 4,
      dayName: 'Thursday (Fetal Bone & Neuro-Developmental Support)',
      breakfast: {
        name: 'Almond Flour Vegetable Crepes or Poached Eggs on 100% Sprouted Grain Toast',
        portion: '2 slices toast with 2 eggs or 2 almond flour crepes with avocado',
        calories: 410,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'Choline (300mg), DHA/EPA, Satiety peptides',
      },
      morningSnack: {
        name: 'Tender Coconut Water (1 glass) + 6 Soaked Almonds (peeled)',
        portion: '200ml coconut water + almonds',
        calories: 130,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'Electrolytes, Vitamin E, Healthy Monounsaturated fats',
      },
      lunch: {
        name: 'Rajma (Red Kidney Beans) Curry with Cauliflower-Rice Blend & Cucumber Raita',
        portion: '1.5 cups rajma curry + 1 cup cauliflower-brown rice blend',
        calories: 530,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'Soluble fiber (lowers cholesterol & insulin surge), Folate',
      },
      eveningSnack: {
        name: 'Apple Slices with 1 Tablespoon Natural Peanut/Almond Butter',
        portion: '1 medium apple + 15g nut butter',
        calories: 170,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'Pectin fiber, healthy fats prevent late afternoon sugar drop',
      },
      dinner: {
        name: `${proteinMain} with Sauteed Asparagus, Carrots & Herbed Millet Pilaf`,
        portion: '150g protein source + 1/2 cup cooked millet',
        calories: 470,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'Vitamin K, Folate, Lean protein',
      },
      dailyTotalCalories: 1800,
      keyTargetNutrients: ['Calcium: 1100mg', 'Choline: 480mg', 'Iron: 25mg'],
    },
    {
      day: 5,
      dayName: 'Friday (Immunity & Cervical Mucosal Protection)',
      breakfast: {
        name: 'Vegetable Upma prepared with Broken Wheat (Dalia) & Crushed Peanuts',
        portion: '1.5 cups cooked dalia upma + ginger lemon tea (decaf)',
        calories: 370,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'B-vitamins, Complex carbohydrates, Low glycemic response',
      },
      morningSnack: {
        name: 'Mixed Citrus Salad: Oranges, Kiwi & Mint with Chia Seeds',
        portion: '1 small bowl (100g)',
        calories: 120,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'Vitamin C, Bioflavonoids (strengthens mucosal barrier)',
      },
      lunch: {
        name: 'Grilled Vegetable & Paneer/Tofu Skewers with Mint Dip & Steamed Barley',
        portion: '2 skewers + 3/4 cup cooked barley',
        calories: 510,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'Barley beta-glucan suppresses post-meal glucose peak',
      },
      eveningSnack: {
        name: 'Sprouted Green Gram & Boiled Sweet Potato Chaat with Lime Juice',
        portion: '1 cup (120g)',
        calories: 180,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'Beta-carotene (pro-vitamin A), Vitamin B6',
      },
      dinner: {
        name: 'Spinach & Methi Lentil Stew (Dal Palak) with 2 Bajra (Pearl Millet) Rotis',
        portion: '1.5 cups stew + 2 small bajra rotis',
        calories: 480,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'Pearl millet is naturally gluten-free and mineral-dense',
      },
      dailyTotalCalories: 1750,
      keyTargetNutrients: ['Vitamin A (Carotenoids)', 'Zinc', 'Fiber: 38g'],
    },
    {
      day: 6,
      dayName: 'Saturday (Restorative Micronutrient Balance)',
      breakfast: {
        name: 'Idli (fermented black gram and rice) with Vegetable Sambhar & Coconut Chutney',
        portion: '2 medium idlis + generous bowl of dal sambhar with drumsticks',
        calories: 360,
        glycemicIndex: 'Medium',
        nutrientsHighlight: 'Bio-fermented B-vitamins, Gut microbiome support',
      },
      morningSnack: {
        name: 'Handful of Mixed Dried Figs (Anjeer) and Roasted Pumpkin Seeds',
        portion: '2 dried figs + 1 tbsp pumpkin seeds',
        calories: 140,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'Natural bioavailable iron, Zinc, Dietary fiber',
      },
      lunch: {
        name: 'Warm Roasted Butternut Squash & Chickpea Bowl with Quinoa',
        portion: '350g bowl with tahini and cumin drizzle',
        calories: 520,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'Antioxidants, Satiety hormones, Sustained glucose level',
      },
      eveningSnack: {
        name: 'Carrot & Cucumber Crudites with Homemade Garlic White Bean Dip',
        portion: '1 cup veggie sticks + 3 tbsp hummus/bean dip',
        calories: 150,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'Prebiotic fiber, Allicin (anti-inflammatory)',
      },
      dinner: {
        name: `${proteinMain} with Stir-Fried Zucchini, Bell Peppers and Green Peas`,
        portion: '150g protein source + 1.5 cups cooked vegetables',
        calories: 460,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'High protein-to-carb ratio, minimizes nocturnal hyperglycemia',
      },
      dailyTotalCalories: 1720,
      keyTargetNutrients: ['Folate: 640mcg', 'Iron: 26mg', 'Potassium: 3100mg'],
    },
    {
      day: 7,
      dayName: 'Sunday (Weekly Metabolic Reset & Preparation)',
      breakfast: {
        name: 'Berry Avocado Green Smoothie Bowl topped with Hemp Seeds & Toasted Oats',
        portion: '1 bowl (spinach, 1/2 avocado, berries, chia, unsweetened almond milk)',
        calories: 390,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'Folate, Healthy plant lipids, Cellular membrane repair',
      },
      morningSnack: {
        name: 'Spiced Roasted Makhana with Roasted Flaxseeds',
        portion: '35g bowl',
        calories: 140,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'Lignans, Omega-3 fatty acids',
      },
      lunch: {
        name: 'Mixed Dal Tadka (Panchratna) with 2 Missi Roti (chickpea-wheat flour) & Fresh Kachumber Salad',
        portion: '1.5 cups dal + 2 small rotis + 1 bowl cucumber tomato onion salad with lemon',
        calories: 540,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'High protein flour reduces glycemic load of rotis by 40%',
      },
      eveningSnack: {
        name: 'Warm Turmeric Spiced Golden Milk (made with skimmed or oat milk)',
        portion: '180ml with pinch of black pepper and cardamom',
        calories: 130,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'Curcumin anti-inflammatory, Piperine absorption enhancer',
      },
      dinner: {
        name: 'Grilled Vegetable & Paneer Salad with Lemon-Herb Vinaigrette + 1 Small Jowar Roti',
        portion: 'Large salad plate + 1 roti',
        calories: 450,
        glycemicIndex: 'Low',
        nutrientsHighlight: 'Light evening meal aids overnight maternal glucose stability',
      },
      dailyTotalCalories: 1740,
      keyTargetNutrients: ['Curcumin & Polyphenols', 'Magnesium', 'Hydration: 3L met'],
    },
  ];

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
