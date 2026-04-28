import { Request, Response } from "express";
import * as productService from "../services/product.service";

export async function getProducts(req: Request, res: Response) {
  const { cat, search } = req.query;
  try {
    const products = await productService.getAllProducts({
      cat: typeof cat === "string" ? cat : undefined,
      search: typeof search === "string" ? search : undefined,
    });
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getCategories(req: Request, res: Response) {
  try {
    const categories = await productService.getCategories();
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getProduct(req: Request, res: Response) {
  try {
    const product = await productService.getProductById(String(req.params.id));
    res.json(product);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
}
