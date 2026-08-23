import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Local, on-device post store (no backend yet). One row per calendar day —
 * DayOne only allows a single post per day (see DESIGN_SYSTEM.md and the
 * Add-Default screen, Figma node 3184:5508), so `savePost` upserts by date
 * rather than ever creating a second row for the same day.
 */
/**
 * How the post's photo is framed. Figma draws these as two separate detail
 * screens — Post-Only Photo-Fit (node 3192:11908) shows the whole photo
 * letterboxed inside the square, Post-Only Photo-Filled (3192:12382) crops it
 * to fill — so the choice made with the Add screen's Fit/Filled toggle has to
 * be stored with the post, not just held in that screen's state.
 */
export type PhotoFit = 'fit' | 'filled';

export type Post = {
  id: string;
  /** Local calendar date the post belongs to, 'YYYY-MM-DD'. */
  date: string;
  /** Local file URI of the post's single photo, or null if text-only. */
  photoUri: string | null;
  fitMode: PhotoFit;
  /**
   * The story as plain text. Kept alongside `html` because emptiness checks,
   * and later any list preview or search, want text rather than markup.
   */
  text: string;
  /** The story as rich HTML from the editor, or null for a plain-text post. */
  html: string | null;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = 'dayone.posts.v1';

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

/** Local-time date key ('YYYY-MM-DD') for a Date — never UTC, so "today" matches the device's calendar day. */
export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Inverse of `dateKey`. Built field by field rather than with `new Date(key)`,
 * which parses a bare 'YYYY-MM-DD' as UTC midnight and so lands on the
 * previous day for anyone west of Greenwich.
 */
export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

async function readAll(): Promise<Post[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // `fitMode` was added after the first rows were written; default those to
    // 'fit' rather than letting the detail screen read undefined.
    // `fitMode` and `html` were both added after the first rows were written;
    // default them rather than letting screens read undefined.
    return parsed.map(
      (post) => ({ ...post, fitMode: post.fitMode ?? 'fit', html: post.html ?? null }) as Post,
    );
  } catch {
    return [];
  }
}

async function writeAll(posts: Post[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export async function getAllPosts(): Promise<Post[]> {
  return readAll();
}

export async function getPostByDate(date: string): Promise<Post | null> {
  const posts = await readAll();
  return posts.find((post) => post.date === date) ?? null;
}

/**
 * Creates the post for `input.date`, or updates it in place if one already
 * exists — this is what enforces "one post per day" rather than a separate
 * validation step.
 */
export async function savePost(input: {
  date: string;
  photoUri: string | null;
  fitMode: PhotoFit;
  /**
   * The story as plain text. Kept alongside `html` because emptiness checks,
   * and later any list preview or search, want text rather than markup.
   */
  text: string;
  /** The story as rich HTML from the editor, or null for a plain-text post. */
  html: string | null;
}): Promise<Post> {
  const posts = await readAll();
  const now = new Date().toISOString();
  const existingIndex = posts.findIndex((post) => post.date === input.date);

  if (existingIndex !== -1) {
    const updated: Post = {
      ...posts[existingIndex],
      photoUri: input.photoUri,
      fitMode: input.fitMode,
      text: input.text,
      html: input.html,
      updatedAt: now,
    };
    posts[existingIndex] = updated;
    await writeAll(posts);
    return updated;
  }

  const created: Post = {
    id: `${input.date}-${Math.random().toString(36).slice(2, 10)}`,
    date: input.date,
    photoUri: input.photoUri,
    fitMode: input.fitMode,
    text: input.text,
    html: input.html,
    createdAt: now,
    updatedAt: now,
  };
  await writeAll([...posts, created]);
  return created;
}

/** Posts whose date falls in the given month. `month` is 0-indexed, matching `Date#getMonth()`. */
export async function getPostsForMonth(year: number, month: number): Promise<Post[]> {
  const posts = await readAll();
  const prefix = `${year}-${pad(month + 1)}-`;
  return posts.filter((post) => post.date.startsWith(prefix));
}
