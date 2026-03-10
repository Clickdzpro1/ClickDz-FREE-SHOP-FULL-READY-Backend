import { Request, Response } from "express";
import { geoService } from "../services/geo.service";
import { success } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const getWilayas = asyncHandler(async (_req: Request, res: Response) => {
  const result = await geoService.getWilayas();
  res.json(success(result));
});

export const getWilayaById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const result = await geoService.getWilayaById(id);
  if (!result) {
    res.status(404).json({ success: false, message: "Wilaya not found" });
    return;
  }
  res.json(success(result));
});

export const getCommunesByWilaya = asyncHandler(async (req: Request, res: Response) => {
  const wilayaId = parseInt(req.params.wilayaId, 10);
  const result = await geoService.getCommunesByWilaya(wilayaId);
  res.json(success(result));
});

export const searchCommunes = asyncHandler(async (req: Request, res: Response) => {
  const query = (req.query.q as string) || "";
  const result = await geoService.searchCommunes(query);
  res.json(success(result));
});
