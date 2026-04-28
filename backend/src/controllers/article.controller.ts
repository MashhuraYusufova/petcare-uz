import { Request, Response } from "express";
import * as articleService from "../services/article.service";

export async function getArticles(req: Request, res: Response) {
  const { cat, search } = req.query;
  try {
    const articles = await articleService.getAllArticles({
      cat: typeof cat === "string" ? cat : undefined,
      search: typeof search === "string" ? search : undefined,
    });
    res.json(articles);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getArticle(req: Request, res: Response) {
  try {
    const article = await articleService.getArticleById(String(req.params.id));
    res.json(article);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
}
