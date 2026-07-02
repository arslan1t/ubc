import type { Metadata } from 'next';
import { NewsArticleContent } from './news-article-content';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${API_URL}/news/${slug}`, { next: { revalidate: 300 } });
    if (res.ok) {
      const article = await res.json();
      const description = article.excerpt ?? article.content?.slice(0, 160) ?? 'Статья на UBC';
      return {
        title: article.title,
        description,
        openGraph: {
          title: article.title,
          description,
          type: 'article',
          ...(article.coverUrl ? { images: [article.coverUrl] } : {}),
        },
      };
    }
  } catch {
    // fall through to generic metadata
  }
  return {
    title: slug.replace(/-/g, ' '),
    description: 'Статья на UBC',
  };
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <NewsArticleContent slug={slug} />;
}
