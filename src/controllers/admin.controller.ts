import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { success } from "../utils/apiResponse";
import { adminService } from "../services/admin.service";
import { parsePagination, buildPaginatedResult } from "../utils/pagination";

export const getDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await adminService.getDashboardStats();
  res.json(success(stats));
});

export const listCustomers = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as any);
  const search = req.query.search as string | undefined;
  const { customers, total } = await adminService.listCustomers(pagination, search);
  res.json(success(buildPaginatedResult(customers, total, pagination)));
});

export const getCustomerDetail = asyncHandler(async (req: Request, res: Response) => {
  const customer = await adminService.getCustomerDetail(req.params.id);
  if (!customer) {
    res.status(404).json({ success: false, message: "Customer not found" });
    return;
  }
  res.json(success(customer));
});

export const exportOrders = asyncHandler(async (req: Request, res: Response) => {
  const { status, from, to } = req.query as Record<string, string>;
  const csv = await adminService.exportOrdersCsv({ status, from, to });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=orders-${Date.now()}.csv`);
  res.send(csv);
});

export const listShippingRates = asyncHandler(async (_req: Request, res: Response) => {
  const rates = await adminService.listShippingRates();
  res.json(success(rates));
});

export const upsertShippingRate = asyncHandler(async (req: Request, res: Response) => {
  const rate = await adminService.upsertShippingRate(req.body);
  res.json(success(rate, "Shipping rate saved"));
});

export const deleteShippingRate = asyncHandler(async (req: Request, res: Response) => {
  await adminService.deleteShippingRate(req.params.id);
  res.json(success(null, "Shipping rate deleted"));
});
