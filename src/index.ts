import  express  from "express";
import categoryRoutes from "./routes/categoryRoutes";
import postRoutes from "./routes/postRoutes";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/' , (req, res) => {
    res.send("Hello world")
});

app.use("/categories", categoryRoutes);
app.use("/posts", postRoutes);

app.listen(PORT , () => {
    console.log(`server running on http://localhost:${PORT}`);
});