import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());


// for now just to check if the server runs as intended
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Resume Generator API is running"
    });
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});