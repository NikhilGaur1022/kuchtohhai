import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import { parseStringPromise } from 'xml2js';
import * as dotenv from 'dotenv';
import striptags from 'striptags';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
}
const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const RSS_FEED_URL = 'https://dentalreach.today/feed/';
const BATCH_SIZE = 15;
const LEGACY_USER_ID = '0a4e694d-500d-4825-ab61-57d5ab3f42ac';

function estimateReadingTime(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200)); // 200 wpm
}

async function fetchOgImage(url: string): Promise<string | null> {
  try {
    // Timeout logic for fetch (10s)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    const html = await res.text();
    const match = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function normalizeCategory(cat: any): string {
  if (Array.isArray(cat)) return (cat[0] || '').trim();
  if (typeof cat === 'string') return cat.trim();
  return '';
}

function normalizeTags(tags: string[]): string[] {
  return Array.from(new Set(tags.map(t => t.toLowerCase().trim()).filter(Boolean)));
}

async function importArticles() {
  try {
    const rssRes = await fetch(RSS_FEED_URL);
    const xml = await rssRes.text();
    const parsed = await parseStringPromise(xml, { explicitArray: false, mergeAttrs: true });

    // Defensive logging and checks
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('RSS feed did not parse to an object. Top-level value: ' + JSON.stringify(parsed));
    }
    if (!parsed.rss) {
      throw new Error('No <rss> root found in parsed feed. Top-level keys: ' + Object.keys(parsed));
    }
    if (!parsed.rss.channel) {
      throw new Error('No <channel> found in <rss>. RSS keys: ' + Object.keys(parsed.rss));
    }
    const itemsRaw = parsed.rss.channel.item;
    if (!itemsRaw) throw new Error('No <item> found in <channel>. Channel keys: ' + Object.keys(parsed.rss.channel));
    const items = Array.isArray(itemsRaw) ? itemsRaw : [itemsRaw];

    const articles = await Promise.all(items.map(async (item: any) => {
      const title = item.title?.trim();
      let content = (item['content:encoded'] || item.description || '').trim();
      if (!content && title) {
        console.warn(`No content for article: ${title} (${item.link || 'no link'})`);
      }
      if (!title || !content) {
        console.error('Skipping article with missing title/content:', { title, content, link: item.link });
        return null;
      }
      const excerpt = striptags(content).slice(0, 200).trim();
      const author = (item['dc:creator'] || '').trim();
      const category = normalizeCategory(item.category);
      let tags = category ? [category] : [];
      tags = normalizeTags(tags);
      const link = (item.link || '').trim();
      const image_url = await fetchOgImage(link);
      const reading_time = estimateReadingTime(striptags(content));
      const published_at = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();
      return {
        title,
        excerpt,
        content,
        author,
        category,
        image_url,
        tags,
        reading_time,
        views_count: 0,
        likes_count: 0,
        is_approved: true,
        is_featured: false,
        approval_notes: null,
        approved_by: null,
        approved_at: null,
        published_at,
        user_id: LEGACY_USER_ID,
        created_at: published_at,
        updated_at: published_at,
      };
    }));

    // Filter out nulls
    const validArticles = articles.filter(Boolean);
    for (let i = 0; i < validArticles.length; i += BATCH_SIZE) {
      const batch = validArticles.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from('articles').insert(batch);
      if (error) {
        console.error('Supabase insert error:', error, batch);
      } else {
        console.log(`Inserted batch ${i / BATCH_SIZE + 1}`);
      }
    }
  } catch (error) {
    console.error('Error importing articles:', error);
  }
}

importArticles();
