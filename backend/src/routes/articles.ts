import { Router } from "express";
import * as articleController from "../controllers/article.controller";

const router = Router();

router.get("/", articleController.getArticles);
router.get("/:id", articleController.getArticle);

export default router;
