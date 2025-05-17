interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  coverUrl: string;
  description: string;
  totalPages: number;
  series?: string;
  content: string[];
}

export const books: Book[] = [
  {
    id: "letters-to-law-student",
    title: "Letters to a Law Student",
    author: "Nicholas J. McBride",
    isbn: "9781292149240",
    coverUrl: "/book-covers/letters-to-law-student.jpg",
    description: "A guide offering practical, emotional, and academic advice to help aspiring lawyers navigate their journey through legal education.",
    totalPages: 392,
    content: [
      "Chapter 1: Thinking About Studying Law: Dear Sam, I was very interested to receive your letter asking for advice about studying law...",
      // Additional content would be added here
    ]
  },
  {
    id: "power-of-subconscious-mind",
    title: "The Power of Your Subconscious Mind",
    author: "Joseph Murphy",
    isbn: "9780735204318",
    coverUrl: "/book-covers/power-of-subconscious-mind.jpg",
    description: "A powerful self-help classic that teaches you how to harness the untapped power of your subconscious mind to achieve your goals and create positive change.",
    totalPages: 312,
    content: [
      "Chapter 1: The Treasure House Within You: The infinite intelligence within your subconscious mind can reveal to you everything you need to know...",
      // Additional content would be added here
    ]
  },
  {
    id: "think-and-grow-rich",
    title: "Think and Grow Rich",
    author: "Napoleon Hill",
    isbn: "9781585424337",
    coverUrl: "/book-covers/think-and-grow-rich.jpg",
    description: "A timeless classic that reveals the secrets to success and personal achievement through the power of thought and personal belief.",
    totalPages: 238,
    content: [
      "Chapter 1: Thoughts Are Things: TRULY, thoughts are things, and powerful things at that, when they are mixed with definiteness of purpose...",
      // Additional content would be added here
    ]
  },
  {
    id: "things-fall-apart",
    title: "Things Fall Apart",
    author: "Chinua Achebe",
    isbn: "9780385474542",
    coverUrl: "/book-covers/things-fall-apart.jpg",
    description: "A classic of African literature, Things Fall Apart is a masterpiece that explores the clash between colonial powers and traditional Igbo society.",
    totalPages: 209,
    content: [
      "Chapter 1: Okonkwo was well known throughout the nine villages and even beyond...",
      // Additional content would be added here
    ]
  },
  {
    id: "things-you-can-see",
    title: "The Things You Can See Only When You Slow Down",
    author: "Haemin Sunim",
    isbn: "9780241340660",
    coverUrl: "/book-covers/things-you-can-see.jpg",
    description: "A mindful exploration of modern life and finding beauty in the everyday moments.",
    totalPages: 288,
    content: [
      "Chapter 1: Why We Should Rest: Rest is not a waste of time...",
      // Additional content would be added here
    ]
  },
  {
    id: "sapiens",
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    isbn: "9780062316097",
    coverUrl: "/book-covers/sapiens.jpg",
    description: "A groundbreaking narrative of humanity's creation and evolution.",
    totalPages: 443,
    content: [
      "Chapter 1: An Animal of No Significance: About 13.5 billion years ago...",
      // Additional content would be added here
    ]
  },
  {
    id: "homo-deus",
    title: "Homo Deus: A Brief History of Tomorrow",
    author: "Yuval Noah Harari",
    isbn: "9781910701881",
    coverUrl: "/book-covers/homo-deus.jpg",
    description: "An exploration of humanity's future and the quest to upgrade humans into gods.",
    totalPages: 464,
    content: [
      "Chapter 1: The New Human Agenda: At the dawn of the third millennium...",
      // Additional content would be added here
    ]
  },
  {
    id: "thriving-with-ei",
    title: "Thriving with Emotional Intelligence",
    author: "Enahoro Okhae",
    isbn: "9789789820498",
    coverUrl: "/book-covers/thriving-with-ei.jpg",
    description: "A guide to developing and utilizing emotional intelligence in personal and professional life.",
    totalPages: 250,
    content: [
      "Chapter 1: Understanding Emotional Intelligence: What is EI...",
      // Additional content would be added here
    ]
  },
  {
    id: "how-to-be-adored",
    title: "How to Be Adored",
    author: "Caroline Fox",
    isbn: "9781846942761",
    coverUrl: "/book-covers/how-to-be-adored.jpg",
    description: "A guide to cultivating charm and building meaningful relationships.",
    totalPages: 224,
    content: [
      "Chapter 1: The Art of Being Adored: What does it mean to be truly adored...",
      // Additional content would be added here
    ]
  },
  {
    id: "icebreaker",
    title: "Icebreaker",
    author: "Hannah Grace",
    isbn: "9781668026038",
    coverUrl: "/book-covers/icebreaker.jpg",
    description: "A captivating romance between a figure skater and a hockey player.",
    totalPages: 448,
    content: [
      "Chapter 1: The ice rink was empty except for the lone figure gliding across its surface...",
      // Additional content would be added here
    ]
  },
  {
    id: "happy-sexy-millionaire",
    title: "Happy Sexy Millionaire",
    author: "Steven Bartlett",
    isbn: "9781529393262",
    coverUrl: "/book-covers/happy-sexy-millionaire.jpg",
    description: "Unexpected truths about fulfillment, love, and success.",
    totalPages: 272,
    content: [
      "Chapter 1: The Social Media Illusion: We're living in unprecedented times...",
      // Additional content would be added here
    ]
  },
  {
    id: "twisted-love",
    title: "Twisted Love",
    author: "Ana Huang",
    isbn: "9798985659009",
    coverUrl: "/book-covers/twisted-love.jpg",
    series: "Twisted",
    description: "A steamy and emotional contemporary romance.",
    totalPages: 406,
    content: [
      "Chapter 1: The first time I saw him, I knew he would be my undoing...",
      // Additional content would be added here
    ]
  },
  {
    id: "twisted-games",
    title: "Twisted Games",
    author: "Ana Huang",
    isbn: "9798985659016",
    coverUrl: "/book-covers/twisted-games.jpg",
    series: "Twisted",
    description: "A royal bodyguard romance filled with tension and desire.",
    totalPages: 442,
    content: [
      "Chapter 1: Protocol dictated that I remain three steps behind the princess at all times...",
      // Additional content would be added here
    ]
  },
  {
    id: "ignite-me",
    title: "Ignite Me",
    author: "Tahereh Mafi",
    isbn: "9780062085573",
    coverUrl: "/book-covers/ignite-me.jpg",
    description: "The explosive finale to the Shatter Me series.",
    totalPages: 416,
    content: [
      "Chapter 1: I am an hourglass. My time is running out...",
      // Additional content would be added here
    ]
  },
  {
    id: "life-lessons-monk",
    title: "Life Lessons from the Monk Who Sold His Ferrari",
    author: "Robin Sharma",
    isbn: "9781401900144",
    coverUrl: "/book-covers/life-lessons-monk.jpg",
    description: "Timeless wisdom for living a life of purpose and meaning.",
    totalPages: 224,
    content: [
      "Chapter 1: The Wake-Up Call: Every journey has a first step...",
      // Additional content would be added here
    ]
  }
].concat([
  // ... paste all the existing books here
]);

export type { Book }; 