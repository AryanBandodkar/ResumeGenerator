import { supabase } from "../services/supabaseClient.js";

export async function register(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Name, email, and password are required.",
        });
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
    });

    if (error) {
        return res.status(400).json({ success: false, message: error.message });
    }

    // If email confirmation is enabled, no session is returned yet,
    // so we cannot create the profile row until the user confirms.
    if (!data.session) {
        return res.json({
            success: true,
            message: "Account created. Please check your email to confirm your account before logging in.",
        });
    }

    // Insert into the profiles table using the signed-up user's token
    // (required because the profiles table has Row Level Security enabled).
    await supabase
        .from("profiles")
        .insert({ id: data.user.id, full_name: name });

    res.status(201).json({
        success: true,
        data: {
            user: {
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.full_name || name,
            },
            token: data.session.access_token,
        },
    });
}

export async function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required.",
        });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return res.status(401).json({ success: false, message: error.message });
    }

    const name = data.user.user_metadata?.full_name || email.split("@")[0];

    // Ensure a profile row exists (covers users who signed up before this
    // feature, or signed up while email confirmation was enabled).
    await supabase
        .from("profiles")
        .upsert({ id: data.user.id, full_name: name, updated_at: new Date().toISOString() });

    res.json({
        success: true,
        data: {
            user: {
                id: data.user.id,
                email: data.user.email,
                name,
            },
            token: data.session.access_token,
        },
    });
}