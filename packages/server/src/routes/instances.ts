import { Router, Request as ExpressRequest, Response, NextFunction } from "express";
import {
  ClerkExpressRequireAuth,
  clerkClient,
} from "@clerk/clerk-sdk-node";
import Instance from "../models/Instance";
import User from "../models/User";
import ensureUserInDatabase from '../middleware/userMiddleware';


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
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const instance = await user.createInstance({ name, description, settings });
      res.status(201).json(instance);
    } catch (error) {
      res.status(500).json({ error: "Internal server error.\n " + error });
    }
  }
);

// Read all instances
router.get("/",
  ClerkExpressRequireAuth({}),
  async (req, res) => {
  try {
    const customReq = req as CustomRequest;
    console.log(customReq.auth)
    console.log(await clerkClient.users.getUser(customReq.auth.userId));
    const instances = await Instance.findAll();
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
router.put("/:id", async (req, res) => {
  try {
    const [updated] = await Instance.update(req.body, {
      where: { id: req.params.id },
    });
    if (updated) {
      const updatedInstance = await Instance.findByPk(req.params.id);
      res.status(200).json(updatedInstance);
    } else {
      res.status(404).json({ error: "Instance not found" });
    }
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
