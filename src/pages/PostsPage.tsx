import { useQuery } from "convex/react";
import {
  ArrowLeft,
  ExternalLink,
  Facebook,
  HelpCircle,
  Send,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "../../convex/_generated/api";
import { useTranslation } from "@/contexts/TranslationContext";

export function PostsPage() {
  const { t } = useTranslation();
  const articles = useQuery(api.articles.list, { limit: 30 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <ArrowLeft className="size-5 text-muted-foreground hover:text-foreground transition-colors" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">{t("posts.title")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("posts.subtitle")}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <HelpCircle className="size-5 text-muted-foreground" />
        </Button>
      </div>

      {articles && articles.length > 0 ? (
        <div className="space-y-3">
          {articles.map((article) => (
            <Card key={article._id}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  {article.imageUrl && (
                    <img
                      src={article.imageUrl}
                      alt=""
                      className="size-16 sm:w-24 sm:h-16 rounded-lg object-cover shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold line-clamp-2">
                        {article.rewrittenTitle || article.title}
                      </h3>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                      >
                        <ExternalLink className="size-4 text-muted-foreground hover:text-primary" />
                      </a>
                    </div>
                    {article.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {article.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className="text-[10px] capitalize"
                      >
                        {article.source}
                      </Badge>
                      {article.isRewritten && (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]"
                        >
                          AI Rewritten
                        </Badge>
                      )}
                      {article.sentToTelegram && (
                        <Badge
                          variant="outline"
                          className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-[10px]"
                        >
                          <Send className="size-2.5 mr-1" />
                          Telegram
                        </Badge>
                      )}
                      {article.sentToFacebook && (
                        <Badge
                          variant="outline"
                          className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-[10px]"
                        >
                          <Facebook className="size-2.5 mr-1" />
                          Facebook
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {new Date(article.fetchedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              {t("posts.noPosts")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
