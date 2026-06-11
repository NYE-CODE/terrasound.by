import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api, type BlogPostCard } from "../lib/api";
import { usePageMeta } from "../hooks/usePageMeta";
import { pageContentPy } from "../lib/pageLayout";

export function BlogPage() {
  const [posts, setPosts] = useState<BlogPostCard[]>([]);

  usePageMeta({
    title: "Блог",
    description: "Экспертные советы и материалы об автозвуке от TerraSound в Гродно.",
    path: "/blog",
  });

  useEffect(() => {
    api.getBlogPosts().then(setPosts).catch(console.error);
  }, []);

  return (
    <div className="pt-20 min-h-screen">
      <div className={`max-w-[1400px] mx-auto px-6 ${pageContentPy}`}>
        <div className="mb-12">
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl mb-4">Блог</h1>
          <p className="text-muted-foreground text-lg">
            Экспертные советы и материалы об автозвуке
          </p>
        </div>

        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-card border border-card-border rounded p-8 hover:border-accent transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="text-xs text-accent font-heading uppercase tracking-wider">
                  {post.category}
                </span>
                <span className="text-xs text-muted-foreground">{post.createdAt}</span>
              </div>
              <h2 className="font-heading text-2xl mb-3">
                <Link to={`/blog/${post.id}`} className="hover:text-accent transition-colors duration-300">
                  {post.title}
                </Link>
              </h2>
              <p className="text-muted-foreground mb-6">{post.excerpt}</p>
              <Link
                to={`/blog/${post.id}`}
                className="text-sm text-accent hover:underline font-heading uppercase tracking-wider"
              >
                Читать далее →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
