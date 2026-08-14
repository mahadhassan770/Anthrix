import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const { GET, POST: defaultPost } = toNextJsHandler(auth);

export { GET };

export const POST = async (req: Request) => {
  try {
    // Clone the request to read its body without consuming it
    const clonedReq = req.clone();
    const bodyText = await clonedReq.text();
    console.log("--- INCOMING AUTH POST ---");
    console.log("URL:", req.url);
    console.log("Payload:", bodyText);
    console.log("--------------------------");
  } catch (e) {
    console.error("Error logging auth POST:", e);
  }
  
  return defaultPost(req);
};
