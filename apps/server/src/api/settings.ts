import { Elysia } from "elysia";
import * as settingsService from "../services/settings.js";
import * as qbitService from "../services/qbit.js";

export const settingsRoutes = new Elysia({ prefix: "/api/settings" })
  .get("/", async () => {
    try {
      const settings = await settingsService.getSettings();
      return settings || { qbitUrl: "", username: "" };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  })
  .post("/", async ({ body }) => {
    try {
      const { qbitUrl, username, password } = body as {
        qbitUrl: string;
        username: string;
        password: string;
      };

      if (!qbitUrl || !username || !password) {
        return { error: "Missing required fields: qbitUrl, username, password" };
      }

      await settingsService.saveSettings({
        qbitUrl,
        username,
        password,
      });

      return { success: true };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  })
  .post("/test", async () => {
    try {
      const success = await qbitService.testConnection();
      return { success };
    } catch (error) {
      return { success: false };
    }
  });
