import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { api, type BlogPostDetail } from "../lib/api";
import { usePageMeta } from "../hooks/usePageMeta";
import { pageContentPy, pageTopOffsetClass } from "../lib/pageLayout";
import { formatReviewDate } from "../utils/formatReviewDate";

export function BlogPostPage() {
  const { id } = useParams();
  const postId = id ?? "";
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!postId) return;
    api.getBlogPost(postId)
      .then(setPost)
      .catch(() => setError(true));
  }, [postId]);

  usePageMeta({
    title: post?.title ?? "Статья",
    description: post?.excerpt ?? "Статья блога TerraSound об автозвуке.",
    path: postId ? `/blog/${postId}` : "/blog",
    type: "article",
  });

  if (error) {
    return (
      <div className={`${pageTopOffsetClass} min-h-screen flex flex-col items-center justify-center gap-4`}>
        <p className="text-muted-foreground">Статья не найдена</p>
        <Link to="/blog" className="text-accent hover:underline font-heading text-sm uppercase tracking-wider">
          ← К блогу
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={`${pageTopOffsetClass} min-h-screen flex items-center justify-center text-muted-foreground`}>
        Загрузка...
      </div>
    );
  }

  const paragraphs = (post.content || post.excerpt)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className={`${pageTopOffsetClass} min-h-screen`}>
      <article className={`max-w-3xl mx-auto px-6 ${pageContentPy}`}>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors duration-300 mb-8"
        >
          <ArrowLeft size={16} />
          К блогу
        </Link>

        <div className="flex items-center gap-4 mb-6">
          <span className="text-xs text-accent font-heading uppercase tracking-wider">
            {post.category}
          </span>
          <span className="text-xs text-muted-foreground">{formatReviewDate(post.createdAt)}</span>
        </div>

        <h1 className="font-heading text-4xl md:text-5xl mb-6">{post.title}</h1>

        <p className="text-lg text-muted-foreground mb-10 border-l-2 border-accent pl-6">
          {post.excerpt}
        </p>

        <div className="prose prose-invert max-w-none space-y-5 text-muted-foreground leading-relaxed">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  );
}
