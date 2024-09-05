import request from "supertest";
import app from "../server";
import Instance from "../models/Instance";
import Admin from "../models/Admin";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import ensureUserInDatabase from "../middleware/adminMiddleware";

jest.mock("@clerk/clerk-sdk-node", () => ({
  /**
   * Mock ClerkExpressRequireAuth, by adding auth to req object.
   */
  // @ts-ignore
  ClerkExpressRequireAuth: jest.fn(() => (req, res, next) => {
    req.auth = { userId: "asdf123" };
    next();
  }),
}));
jest.mock("../middleware/adminMiddleware", () =>
  jest.fn((req, res, next) => next())
);

/**
 * Should we be mocking these? Or actually writing to a test DB.
 */
jest.mock("../models/Instance");
jest.mock("../models/Admin");

describe("POST /api/instances", () => {
  it("should create a new instance", async () => {
    const mockAdmin = {
      createInstance: jest
        .fn()
        .mockResolvedValue({ id: 1, name: "Test Instance" }),
    };
    (Admin.findByPk as jest.Mock).mockResolvedValue(mockAdmin);

    const response = await request(app)
      .post("/api/instances")
      .set("Authorization", "Bearer valid-token") // Mock auth token
      .send({
        name: "Test Instance",
        description: "asdf",
        settings: {
          one: "1",
        },
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id", 1);
    expect(mockAdmin.createInstance).toHaveBeenCalledWith({
      description: "asdf",
      name: "Test Instance",
      settings: {
        "one": "1"
      }
    });
  });

  it("should return 404 if admin not found", async () => {
    (Admin.findByPk as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .post("/api/instances")
      .set("Authorization", "Bearer valid-token")
      .send({ name: "Test Instance" });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error", "Admin not found");
  });
});
