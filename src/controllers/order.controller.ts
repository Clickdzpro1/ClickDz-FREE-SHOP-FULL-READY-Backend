import { Request, Response } from "express";
import { orderService } from "../services/order.service";
import { success, paginated } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

// Customer endpoints
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const result = await orderService.create(req.user!.userId, req.body);
  res.status(201).json(success(result, "Order placed successfully", 201));
});

export const listMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const result = await orderService.listByUser(
    req.user!.userId,
    req.query as Record<string, string>
  );
  res.json(paginated(result.data, result.pagination));
});

export const getMyOrder = asyncHandler(async (req: Request, res: Response) => {
  const result = await orderService.getByIdForUser(req.user!.userId, req.params.id);
  res.json(success(result));
});

export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const result = await orderService.cancel(req.user!.userId, req.params.id);
  res.json(success(result, "Order cancelled"));
});

// Admin endpoints
export const listAllOrders = asyncHandler(async (req: Request, res: Response) => {
  const result = await orderService.listAll(req.query as Record<string, string>);
  res.json(paginated(result.data, result.pagination));
});

export const getOrderAdmin = asyncHandler(async (req: Request, res: Response) => {
  const result = await orderService.getByIdAdmin(req.params.id);
  res.json(success(result));
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const result = await orderService.updateStatus(
    req.params.id,
    req.body,
    req.user!.userId
  );
  res.json(success(result, "Order status updated"));
});
