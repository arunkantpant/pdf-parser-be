import express from "express";
import cors from "cors";

import uploadRoute from "./routes/upload.js";
import askRoute from "./routes/ask.js";
import quizRoute from "./routes/quiz.js";
import { port } from "./utils/config.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

app.use("/upload", uploadRoute);
app.use("/ask", askRoute);
app.use("/quiz", quizRoute);

app.listen(port, () => {
  console.log(`Server is running on port ${process.env.PORT || 5050}`);
});
