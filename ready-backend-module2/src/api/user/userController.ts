import type { Request, RequestHandler, Response } from "express";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { userService } from "@/api/user/userService";
import { authenticate } from "@/middleware/authMiddleware";

class UserController {
  public getUsers: RequestHandler[] = [authenticate, async (_req: Request, res: Response) => {
    const serviceResponse = await userService.findAll();
    return handleServiceResponse(serviceResponse, res);
  }];

  public getUser: RequestHandler[] = [authenticate, async (req: Request, res: Response) => {
    const id = Number.parseInt(req.params.id as string, 10);
    const serviceResponse = await userService.findById(id);
    return handleServiceResponse(serviceResponse, res);
  }];

  public createUser: RequestHandler[] = [authenticate, async (req: Request, res: Response) => {
    const serviceResponse = await userService.create(req.body);
    return handleServiceResponse(serviceResponse, res);
  }];

  public uploadPhoto: RequestHandler[] = [authenticate,async (req: Request, res: Response) => {
      const file = req.file;
      const photoId = req.user.preferred_username;
      const serviceResponse = await userService.uploadPhoto(photoId, file);
      return handleServiceResponse(serviceResponse, res);
    },
  ];
}

export const userController = new UserController();
