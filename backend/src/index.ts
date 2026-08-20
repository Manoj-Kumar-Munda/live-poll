import { connectDB } from "@/config/db.js";
import { env } from "@/config/env.js";

await connectDB();

const { default: app } = await import("./app.js");
const { createSocketServer } = await import("@/realtime/socket.server.js");

const { httpServer } = createSocketServer(app);

httpServer.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});
