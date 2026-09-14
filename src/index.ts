import express from "express";
import categoryRoutes from "./routes/categoryRoutes";
import postRoutes from "./routes/postRoutes";
import authRoutes from "./routes/authRoutes";
import bookmarkRoutes from "./routes/boomarkRoute";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello world");
});

app.use("/categories", categoryRoutes);
app.use("/posts", postRoutes);
app.use("/auth", authRoutes);
app.use("/bookmarks", bookmarkRoutes);

app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`);
});