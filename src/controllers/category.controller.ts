import { Request, Response } from "express";
import { categoryService } from "../services/category.service";
import { success } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const result = await categoryService.list();
  res.json(success(result));
});

export const getCategoryTree = asyncHandler(async (_req: Request, res: Response) => {
  const result = await categoryService.getTree();
  res.json(success(result));
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const result = await categoryService.getBySlug(req.params.slug);
  res.json(success(result));
});

export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const result = await categoryService.getById(req.params.id);
  res.json(success(result));
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const result = await categoryService.create(req.body);
  res.status(201).json(success(result, "Category created", 201));
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const result = await categoryService.update(req.params.id, req.body);
  res.json(success(result, "Category updated"));
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  await categoryService.delete(req.params.id);
  res.json(success(null, "Category deleted"));
});

export const listAllCategories = asyncHandler(async (_req: Request, res: Response) => {
  const result = await categoryService.listAll();
  res.json(success(result));
});
