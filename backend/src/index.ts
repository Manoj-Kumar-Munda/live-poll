import { connectDB } from "@/config/db.js";
import { env } from "@/config/env.js";
import { createSocketServer } from "@/realtime/socket.server.js";

await connectDB();

const { default: app } = await import("./app.js");

const { httpServer } = createSocketServer(app);

httpServer.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});
