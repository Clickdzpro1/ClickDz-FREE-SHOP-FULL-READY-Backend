import { Request, Response } from "express";
import { productService } from "../services/product.service";
import { success, paginated } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.list(req.query as Record<string, string>);
  res.json(paginated(result.data, result.pagination));
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.getBySlug(req.params.slug);
  res.json(success(result));
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.getById(req.params.id);
  res.json(success(result));
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.create(req.body);
  res.status(201).json(success(result, "Product created", 201));
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.update(req.params.id, req.body);
  res.json(success(result, "Product updated"));
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  await productService.delete(req.params.id);
  res.json(success(null, "Product deleted"));
});

export const addProductImage = asyncHandler(async (req: Request, res: Response) => {
  const url = req.file
    ? `/uploads/${req.file.filename}`
    : req.body.url;
  const result = await productService.addImage(req.params.id, url, req.body.altText);
  res.status(201).json(success(result, "Image added", 201));
});

export const deleteProductImage = asyncHandler(async (req: Request, res: Response) => {
  await productService.deleteImage(req.params.imageId);
  res.json(success(null, "Image deleted"));
});

export const getFeaturedProducts = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const result = await productService.getFeatured(limit);
  res.json(success(result));
});
