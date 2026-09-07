import { supabase } from "../services/supabaseClient.js";

export async function requireAuth(req, res, next) {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication required.",
        });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token.",
        });
    }

    req.user = data.user;
    next();
}