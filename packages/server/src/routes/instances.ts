import { Router, Request as ExpressRequest, Response, NextFunction } from "express";
import {
  ClerkExpressRequireAuth,
} from "@clerk/clerk-sdk-node";
import Instance from "../models/Instance";
import Admin from "../models/Admin";
import ensureUserInDatabase from '../middleware/adminMiddleware';


export interface CustomRequest extends ExpressRequest {
  auth: { userId: string };
  body: {
    name: string;
    description?: string;
    settings?: object;
  };
}


const router = Router();

type CustomRequestHandler = (req: CustomRequest, res: Response, next: NextFunction) => Promise<void>;


router.post(
  "/",
  ClerkExpressRequireAuth({}),
  ensureUserInDatabase,
  async (req, res) => {
    const customReq = req as CustomRequest;
    const { userId } = customReq.auth;
    const { name, description, settings } = customReq.body;

    try {
      const admin = await Admin.findByPk(userId);
      if (!admin) {
        return res.status(404).json({ error: "User not found" });
      }
      const instance = await admin.createInstance({ name, description, settings });
      res.status(201).json(instance);
    } catch (error) {
      res.status(500).json({ error: "Internal server error.\n " + error });
    }
  }
);

// Read all instances for a user
router.get("/",
  ClerkExpressRequireAuth({}),
  async (req, res) => {
  try {
    const customReq = req as CustomRequest;
    const { userId } = customReq.auth;
    const instances = await Instance.findAll({ where: { userId } });
    res.status(200).json(instances);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Read a single instance by ID
router.get("/:id", async (req, res) => {
  try {
    const instance = await Instance.findByPk(req.params.id);
    if (instance) {
      res.status(200).json(instance);
    } else {
      res.status(404).json({ error: "Instance not found" });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Update an instance by ID
// todo: ensure auth
router.put("/:id", ClerkExpressRequireAuth({}), async (req, res) => {
  try {
    const customReq = req as CustomRequest;
    const instance = await Instance.findByPk(req.params.id);

    if (!instance) {
      return res.status(404).json({ error: "Instance not found" });
    }

    if (instance.userId !== customReq.auth.userId) {
      return res.status(403).json({ error: "You do not have permission to update this instance" });
    }
    const updatedInstance = await instance.update(req.body);
    res.status(200).json(updatedInstance);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Delete an instance by ID
router.delete("/:id", ClerkExpressRequireAuth({}), async (req, res) => {
  try {
    const customReq = req as CustomRequest;
    const instance = await Instance.findByPk(req.params.id);

    if (!instance) {
      return res.status(404).json({ error: "Instance not found" });
    }

    if (instance.userId !== customReq.auth.userId) {
      return res.status(403).json({ error: "You do not have permission to delete this instance" });
    }

    await Instance.destroy({
      where: { id: req.params.id },
    });

    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
