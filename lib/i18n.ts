export const languages = ["vi", "en"] as const;

export type Language = (typeof languages)[number];

export const defaultLanguage: Language = "vi";

export type OptionGroup = "food" | "delivery" | "mood";
export type MealId = "morning" | "noon" | "evening";

export type Option = {
  id: string;
  emoji: string;
  labels: Record<Language, string>;
};

export type MealOption = {
  id: MealId;
  emoji: string;
  labels: Record<Language, string>;
  descriptions: Record<Language, string>;
};

export const languageOptions: { code: Language; label: string }[] = [
  { code: "vi", label: "🇻🇳 Tiếng Việt" },
  { code: "en", label: "🇬🇧 English" }
];

export const meals: MealOption[] = [
  {
    id: "morning",
    emoji: "🌤️",
    labels: { vi: "Buổi sáng", en: "Morning" },
    descriptions: { vi: "Bữa sáng hoặc cà phê", en: "Breakfast or coffee" }
  },
  {
    id: "noon",
    emoji: "☀️",
    labels: { vi: "Buổi trưa", en: "Lunch" },
    descriptions: { vi: "Bữa trưa dễ thương", en: "A sweet lunch plan" }
  },
  {
    id: "evening",
    emoji: "🌙",
    labels: { vi: "Buổi tối", en: "Dinner" },
    descriptions: { vi: "Bữa tối cho hai người", en: "Dinner for two" }
  }
];

export const options: Record<OptionGroup, Option[]> = {
  food: [
    { id: "sushi", emoji: "🍣", labels: { vi: "Sushi", en: "Sushi" } },
    { id: "pizza", emoji: "🍕", labels: { vi: "Pizza", en: "Pizza" } },
    { id: "burger", emoji: "🍔", labels: { vi: "Burger", en: "Burger" } },
    { id: "ramen", emoji: "🍣", labels: { vi: "kimbap", en: "kimbap" } },
    { id: "chicken-rice", emoji: "🍗", labels: { vi: "Gà ran", en: "fried chicken" } },
    { id: "healthy", emoji: "🥗", labels: { vi: "Món lành mạnh", en: "Something healthy" } },
    { id: "dessert-first", emoji: "🍰", labels: { vi: "Ăn tráng miệng trước", en: "Dessert first" } },
    { id: "surprise", emoji: "🎲", labels: { vi: "Làm em bất ngờ đi", en: "Surprise me" } },
    { id: "other", emoji: "✍️", labels: { vi: "Tự chọn món", en: "Choose my own food" } }
  ],
  delivery: [
    { id: "delivery", emoji: "🛵", labels: { vi: "Giao tận nhà", en: "Delivery at home" } },
    { id: "restaurant", emoji: "🍽️", labels: { vi: "Ra nhà hàng", en: "Go to a restaurant" } },
    { id: "either", emoji: "💕", labels: { vi: "Sao cũng được", en: "Either is fine" } },
    { id: "let-him-decide", emoji: "😌", labels: { vi: "Để anh quyết định", en: "Let him decide" } }
  ],
  mood: [
    { id: "movie", emoji: "🎬", labels: { vi: "Xem phim và ăn tối", en: "Movie and food" } },
    { id: "walk", emoji: "🌙", labels: { vi: "Đi dạo một chút rồi ăn", en: "A little walk, then food" } },
    { id: "cozy-home", emoji: "🛋️", labels: { vi: "Một tối nhẹ nhàng ở nhà", en: "A cozy night at home" } },
    { id: "pamper", emoji: "💅", labels: { vi: "Em muốn được chiều chuộng", en: "I want to be pampered" } },
    { id: "just-food", emoji: "😤", labels: { vi: "Chỉ ăn thôi, em đói rồi", en: "Just food, I'm hungry" } }
  ]
};

export const translations = {
  vi: {
    meta: {
      title: "Tối nay em muốn ăn gì?",
      description: "Một ứng dụng nhỏ xinh để chọn bữa tối cho hai người."
    },
    language: {
      label: "Chọn ngôn ngữ"
    },
    welcome: {
      title: "Chào em yêu 💗",
      subtitle: "Hôm nay em muốn chọn gì?",
      lines: [
        "Anh đang tò mò xem em sẽ chọn gì 🥰",
        "Mình lên kế hoạch cho buổi tối nhé 💕",
        "Chỉ một chạm thôi là anh biết em thèm gì 🍣",
        "Anh đang chờ xem hôm nay em muốn ăn gì 💗"
      ],
      mealTitle: "Em muốn chọn cho lúc nào?",
      mealSubtitle: "Chọn một ô rồi mình tiếp tục nhé",
      start: "Bắt đầu chọn 💗"
    },
    flow: {
      step: "Bước",
      next: "Tiếp tục",
      back: "Quay lại",
      submit: "Gửi cho anh 💗",
      sending: "Đang gửi...",
      foodQuestion: "Em muốn ăn gì nhất?",
      customFoodLabel: "Em muốn tự nhập món gì?",
      customFoodPlaceholder: "Viết món em muốn ăn ở đây",
      deliveryQuestion: "Em muốn ăn thế nào?",
      moodQuestion: "Em muốn một buổi tối thế nào?",
      noteQuestion: "Có điều gì anh cần biết không?",
      notePlaceholder: "Em có thể nhắn anh một điều nhỏ ở đây 💕",
      voiceQuestion: "Một tin nhắn thoại nhỏ trước khi gửi nhé",
      voiceIntro: "Em cần ghi âm một câu yêu thương nhỏ cho anh nghe.",
      voicePromptTitle: "Chọn câu để ghi âm",
      voicePromptEnglish: "I love you",
      voicePromptHebrew: "Ani ohevet otcha",
      voicePromptVietnamese: "Em yêu anh",
      recordVoice: "Bắt đầu ghi âm",
      stopRecording: "Dừng ghi âm",
      recording: "Đang ghi âm...",
      voiceReady: "Đã có tin nhắn thoại",
      rerecordVoice: "Ghi âm lại",
      arrivalQuestion: "Bao lâu nữa em sẽ đến?",
      arrivalHint: "Kéo điểm trên vòng tròn, tối đa 60 phút",
      minutes: "phút",
      optional: "Không bắt buộc"
    },
    errors: {
      chooseMeal: "Em chọn buổi sáng, trưa hoặc tối trước nha.",
      chooseFood: "Em chọn một món trước nha.",
      customFood: "Em viết món muốn ăn vào ô này nha.",
      chooseDelivery: "Em chọn cách mình ăn tối nha.",
      chooseMood: "Em chọn cảm giác cho buổi tối nha.",
      voiceRequired: "Em cần ghi âm tin nhắn thoại trước khi gửi nha.",
      microphoneFailed: "Không mở được micro. Em thử cho phép quyền micro nhé.",
      submitFailed: "Chưa gửi được. Thử lại giúp anh một lần nữa nhé."
    },
    success: {
      heart: "💗",
      title: "Anh nhận được rồi!",
      body: "Giờ anh biết tối nay em muốn gì",
      subtext: "Anh mong đến tối với em lắm 🥰",
      again: "Chọn lại"
    },
    admin: {
      kicker: "💗 Bữa tối",
      title: "Lịch sử lựa chọn",
      subtitle: "Xem các lựa chọn bữa tối mới nhất.",
      passwordLabel: "Mật khẩu quản trị",
      passwordPlaceholder: "Nhập mật khẩu",
      unlock: "Mở lịch sử",
      loading: "Đang tải...",
      empty: "Chưa có lựa chọn nào.",
      error: "Không mở được lịch sử. Kiểm tra mật khẩu hoặc biến môi trường.",
      date: "Thời gian",
      food: "Món ăn",
      delivery: "Cách ăn",
      mood: "Tâm trạng",
      note: "Ghi chú",
      noNote: "Không có ghi chú"
    },
    notification: {
      title: "💗 Lựa chọn mới",
      meal: "🕰️ Dành cho:",
      food: "🍽️ Món ăn:",
      delivery: "🛵 Cách ăn:",
      mood: "🌙 Tâm trạng:",
      arrival: "⏱️ Em đến trong:",
      voicePrompt: "🎙️ Câu ghi âm:",
      note: "💬 Ghi chú:",
      time: "🕒 Thời gian:",
      noNote: "Không có"
    }
  },
  en: {
    meta: {
      title: "What do you feel like eating tonight?",
      description: "A sweet little dinner picker for two."
    },
    language: {
      label: "Choose language"
    },
    welcome: {
      title: "Hi love 💗",
      subtitle: "What do you feel like choosing today?",
      lines: [
        "I am already curious what you will choose 🥰",
        "Let's make plans for tonight 💕",
        "One tiny tap and I will know what you are craving 🍣",
        "I am waiting to see what sounds good today 💗"
      ],
      mealTitle: "What are we choosing for?",
      mealSubtitle: "Pick a time, then choose what sounds good",
      start: "Start choosing 💗"
    },
    flow: {
      step: "Step",
      next: "Continue",
      back: "Back",
      submit: "Send it to him 💗",
      sending: "Sending...",
      foodQuestion: "What do you want to eat most?",
      customFoodLabel: "What food do you want to choose?",
      customFoodPlaceholder: "Type the food you want here",
      deliveryQuestion: "How do you want to eat?",
      moodQuestion: "What kind of night do you want?",
      noteQuestion: "Is there anything he should know?",
      notePlaceholder: "Write a tiny note here 💕",
      voiceQuestion: "One tiny voice note before sending",
      voiceIntro: "Record a small love message for him to hear.",
      voicePromptTitle: "Choose what to record",
      voicePromptEnglish: "I love you",
      voicePromptHebrew: "Ani ohevet otcha",
      voicePromptVietnamese: "Em yêu anh",
      recordVoice: "Start recording",
      stopRecording: "Stop recording",
      recording: "Recording...",
      voiceReady: "Voice note is ready",
      rerecordVoice: "Record again",
      arrivalQuestion: "How many minutes until you arrive?",
      arrivalHint: "Drag the point around the circle, up to 60 minutes",
      minutes: "min",
      optional: "Optional"
    },
    errors: {
      chooseMeal: "Choose morning, lunch, or dinner first.",
      chooseFood: "Pick something first.",
      customFood: "Type the food you want in the box.",
      chooseDelivery: "Choose how dinner should happen.",
      chooseMood: "Choose the mood for tonight.",
      voiceRequired: "Record the voice note before sending.",
      microphoneFailed: "Could not open the microphone. Please allow microphone access.",
      submitFailed: "That did not send. Please try once more."
    },
    success: {
      heart: "💗",
      title: "Got it!",
      body: "Now he knows what you want tonight",
      subtext: "Already looking forward to tonight with you 🥰",
      again: "Choose again"
    },
    admin: {
      kicker: "💗 Dinner",
      title: "Choice history",
      subtitle: "See the newest dinner choices.",
      passwordLabel: "Admin password",
      passwordPlaceholder: "Enter password",
      unlock: "Open history",
      loading: "Loading...",
      empty: "No choices yet.",
      error: "Could not open history. Check the password or environment variables.",
      date: "Date",
      food: "Food",
      delivery: "How to eat",
      mood: "Mood",
      note: "Note",
      noNote: "No note"
    },
    notification: {
      title: "💗 New food request",
      meal: "🕰️ For:",
      food: "🍽️ Food:",
      delivery: "🛵 How to eat:",
      mood: "🌙 Mood:",
      arrival: "⏱️ Arrives in:",
      voicePrompt: "🎙️ Voice prompt:",
      note: "💬 Note:",
      time: "🕒 Time:",
      noNote: "None"
    }
  }
} as const;

export function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && languages.includes(value as Language);
}

export function getOption(group: OptionGroup, id: string): Option | undefined {
  return options[group].find((option) => option.id === id);
}

export function getOptionLabel(group: OptionGroup, id: string, language: Language): string {
  return getOption(group, id)?.labels[language] ?? id;
}

export function getMeal(id: string): MealOption | undefined {
  return meals.find((meal) => meal.id === id);
}

export function getMealLabel(id: string, language: Language): string {
  return getMeal(id)?.labels[language] ?? id;
}
