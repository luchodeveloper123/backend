import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import supabase from './supabase.js'; 

dotenv.config(); 

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hola desde el servidor!");
});

app.post("/register", async (req, res) => {
    const { usuario, contrasena } = req.body;

    if (!usuario || !contrasena) {
        return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    try {
        const { data: existingUser, error: userError } = await supabase
            .from('usuario')
            .select('*')
            .eq('usuario', usuario)
            .maybeSingle();

        if (userError) {
            console.error("Error al verificar usuario:", userError);
            return res.status(500).json({ error: "Error al verificar usuario." });
        }

        if (existingUser) {
            return res.status(400).json({ error: "El usuario ya está registrado." });
        }

        const { data: newUser, error: insertError } = await supabase
            .from('usuario')
            .insert([{ usuario, contrasena }])
            .select('*');

        if (insertError) {
            console.error("Error al insertar usuario:", insertError);
            return res.status(500).json({ error: "Error al registrar usuario." });
        }

        res.status(201).json({ message: "Usuario registrado con éxito.", usuario: newUser });
    } catch (error) {
        console.error("Error en /register:", error);
        res.status(500).json({ error: "Hubo un problema al registrar el usuario." });
    }
});

app.post("/login", async (req, res) => {
    const { usuario, contrasena } = req.body;

    if (!usuario || !contrasena) {
        return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    try {
        const { data: user, error } = await supabase
            .from('usuario')
            .select('*')
            .eq('usuario', usuario)
            .maybeSingle();

        if (error) {
            console.error("Error al buscar el usuario:", error);
            return res.status(500).json({ error: "Error al buscar el usuario." });
        }

        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        if (contrasena !== user.contrasena) {
            return res.status(401).json({ error: "Contraseña incorrecta." });
        }

        res.status(200).json({ message: "Login exitoso." });
    } catch (error) {
        console.error("Error en /login:", error);
        res.status(500).json({ error: "Error al iniciar sesión." });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});




