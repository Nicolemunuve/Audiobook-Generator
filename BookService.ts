import axios from 'axios';
import { Book } from '../data/books';

interface BookInfo {
  title: string;
  author: string;
  coverUrl: string;
  description: string;
  pages: number;
  content: string[];  // Array of page contents
}

interface AudioSettings {
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
}

interface CacheEntry<T> {
  data: T;
  lastAccessed: number;
}

class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private readonly maxSize: number;

  constructor(maxSize: number) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (entry) {
      // Update last accessed time
      entry.lastAccessed = Date.now();
      return entry.data;
    }
    return undefined;
  }

  set(key: string, value: T): void {
    // Evict least recently used items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed)[0][0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data: value,
      lastAccessed: Date.now()
    });
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

class BookService {
  private static readonly GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';
  private static readonly MAX_BOOKS_CACHE = 20;
  private static readonly MAX_CHUNKS_CACHE = 50;
  
  private speechSynthesis: SpeechSynthesis;
  private speechUtterance: SpeechSynthesisUtterance | null = null;
  private currentSettings: AudioSettings = {
    voice: '',
    rate: 1,
    pitch: 1,
    volume: 1,
  };
  private static instance: BookService;
  private bookCache: LRUCache<Book>;
  private chunkCache: LRUCache<string>;
  private preloadQueue: Set<string> = new Set();

  private constructor() {
    this.speechSynthesis = window.speechSynthesis;
    this.bookCache = new LRUCache<Book>(BookService.MAX_BOOKS_CACHE);
    this.chunkCache = new LRUCache<string>(BookService.MAX_CHUNKS_CACHE);
  }

  public static getInstance(): BookService {
    if (!BookService.instance) {
      BookService.instance = new BookService();
    }
    return BookService.instance;
  }

  public async getBook(id: string): Promise<Book> {
    // Check memory cache first
    const cachedBook = this.bookCache.get(id);
    if (cachedBook) {
      return cachedBook;
    }

    try {
      // Fetch from network
      const response = await fetch(`/api/books/${id}`);
      if (!response.ok) throw new Error('Book not found');
      
      const book = await response.json();
      this.bookCache.set(id, book);
      return book;
    } catch (error) {
      throw error;
    }
  }

  public async getBookChunk(id: string, chunkIndex: number): Promise<string> {
    const cacheKey = `${id}-${chunkIndex}`;
    const cachedChunk = this.chunkCache.get(cacheKey);
    
    if (cachedChunk) {
      return cachedChunk;
    }

    // If chunk is being preloaded, wait for it
    if (this.preloadQueue.has(cacheKey)) {
      await this.waitForPreload(cacheKey);
      const chunk = this.chunkCache.get(cacheKey);
      if (chunk) return chunk;
    }

    try {
      const response = await fetch(`/api/books/${id}/chunks/${chunkIndex}`);
      if (!response.ok) throw new Error('Chunk not found');
      
      const chunk = await response.text();
      this.chunkCache.set(cacheKey, chunk);
      return chunk;
    } catch (error) {
      throw new Error(`Failed to load chunk ${chunkIndex} of book ${id}`);
    }
  }

  private async waitForPreload(cacheKey: string): Promise<void> {
    let attempts = 0;
    const maxAttempts = 10;
    const delay = 100; // ms

    while (this.preloadQueue.has(cacheKey) && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, delay));
      attempts++;
    }
  }

  public async preloadNextChunks(id: string, currentChunk: number, count: number = 3): Promise<void> {
    const preloadPromises: Promise<string | void>[] = [];

    for (let i = 1; i <= count; i++) {
      const chunkIndex = currentChunk + i;
      const cacheKey = `${id}-${chunkIndex}`;

      // Skip if already cached or being preloaded
      if (this.chunkCache.has(cacheKey) || this.preloadQueue.has(cacheKey)) {
        continue;
      }

      this.preloadQueue.add(cacheKey);
      
      const promise = this.getBookChunk(id, chunkIndex)
        .catch(error => {
          console.warn(`Failed to preload chunk ${chunkIndex}:`, error);
          return Promise.resolve();
        })
        .finally(() => this.preloadQueue.delete(cacheKey));

      preloadPromises.push(promise);
    }

    // Wait for all preloads to complete
    await Promise.all(preloadPromises);
  }

  public clearCache(): void {
    this.bookCache.clear();
    this.chunkCache.clear();
    this.preloadQueue.clear();
  }

  public estimateTextDuration(text: string): number {
    // Average reading speed (words per minute)
    const avgWPM = 200;
    const words = text.split(/\s+/).length;
    return Math.ceil((words / avgWPM) * 60);
  }

  async getBookByISBN(isbn: string): Promise<BookInfo> {
    try {
      const response = await axios.get(`${BookService.GOOGLE_BOOKS_API}?q=isbn:${isbn}`);
      const book = response.data.items[0].volumeInfo;

      // In a real application, you would fetch the actual book content from a book content API
      // For demo purposes, we'll create dummy content
      const dummyContent = Array(book.pageCount || 10).fill('')
        .map((_, i) => `This is page ${i + 1} of the book "${book.title}". ${book.description || ''}`);

      return {
        title: book.title,
        author: book.authors?.[0] || 'Unknown Author',
        coverUrl: book.imageLinks?.thumbnail || '',
        description: book.description || '',
        pages: book.pageCount || 0,
        content: dummyContent,
      };
    } catch (error) {
      throw new Error('Failed to fetch book information');
    }
  }

  updateAudioSettings(settings: AudioSettings) {
    this.currentSettings = settings;
    if (this.speechUtterance) {
      this.applyAudioSettings(this.speechUtterance);
    }
  }

  private applyAudioSettings(utterance: SpeechSynthesisUtterance) {
    const voices = this.speechSynthesis.getVoices();
    const selectedVoice = voices.find(v => v.name === this.currentSettings.voice);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = this.currentSettings.rate;
    utterance.pitch = this.currentSettings.pitch;
    utterance.volume = this.currentSettings.volume;
  }

  startSpeaking(text: string, onEnd?: () => void, onTimeUpdate?: (time: number) => void) {
    if (this.speechUtterance) {
      this.speechSynthesis.cancel();
    }

    this.speechUtterance = new SpeechSynthesisUtterance(text);
    this.applyAudioSettings(this.speechUtterance);
    
    if (onEnd) {
      this.speechUtterance.onend = onEnd;
    }

    if (onTimeUpdate) {
      // Approximate time updates since Web Speech API doesn't provide precise timing
      const totalTime = text.length * 0.06 * (1 / this.currentSettings.rate); // rough estimate
      let currentTime = 0;
      const interval = setInterval(() => {
        if (!this.speechUtterance || currentTime >= totalTime) {
          clearInterval(interval);
          return;
        }
        currentTime += 0.1;
        onTimeUpdate(currentTime);
      }, 100);

      this.speechUtterance.onend = () => {
        clearInterval(interval);
        if (onEnd) onEnd();
      };
    }

    this.speechSynthesis.speak(this.speechUtterance);
  }

  pauseSpeaking() {
    this.speechSynthesis.pause();
  }

  resumeSpeaking() {
    this.speechSynthesis.resume();
  }

  stopSpeaking() {
    this.speechSynthesis.cancel();
    this.speechUtterance = null;
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.speechSynthesis.getVoices();
  }
}

export default BookService;
export type { BookInfo, AudioSettings }; 