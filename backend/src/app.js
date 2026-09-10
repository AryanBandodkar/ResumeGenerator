import "dotenv/config";
import express from "express";
import cors from "cors";
import resumeRoutes from "./routes/resumeRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import templateRoutes from "./routes/templateRoutes.js";
import savedResumeRoutes from "./routes/savedResumeRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", resumeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", templateRoutes);
app.use("/api", savedResumeRoutes);


// for now just to check if the server runs as intended
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Resume Generator API is running"
    });
});

// Multer/misc error handler
app.use((err, _req, res, _next) => {
    res.status(400).json({ success: false, message: err.message });
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});