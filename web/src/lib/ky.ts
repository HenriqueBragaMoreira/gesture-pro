import { env } from "@/constants/env.mjs";
import ky from "ky";

export const api = ky.create({
  prefixUrl: env.NEXT_PUBLIC_BASE_URL,
});
