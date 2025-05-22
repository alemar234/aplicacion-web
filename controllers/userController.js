const bcrypt = require('bcryptjs');
const { get, run } = require('../models/db');

const userController = {
    async register(req, res) {
        try {
            const { username, email, password } = req.body;

            // Validaciones básicas
            if (!username || !email || !password) {
                return res.status(400).json({ 
                    error: 'Todos los campos son requeridos',
                    details: {
                        username: !username ? 'El nombre de usuario es requerido' : null,
                        email: !email ? 'El email es requerido' : null,
                        password: !password ? 'La contraseña es requerida' : null
                    }
                });
            }

            // Verificar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ error: 'El formato del email no es válido' });
            }

            // Verificar si el usuario ya existe
            const existingUser = await get(
                'SELECT * FROM users WHERE email = ? OR username = ?',
                [email, username]
            );

            if (existingUser) {
                return res.status(400).json({ 
                    error: 'Usuario ya registrado',
                    details: {
                        email: existingUser.email === email ? 'Este email ya está registrado' : null,
                        username: existingUser.username === username ? 'Este nombre de usuario ya está en uso' : null
                    }
                });
            }

            // Validar longitud de contraseña
            if (password.length < 6) {
                return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
            }

            // Encriptar contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            // Crear usuario
            const result = await run(
                'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                [username, email, hashedPassword]
            );

            res.json({ message: 'Usuario registrado exitosamente' });
        } catch (error) {
            console.error('Error en registro:', error);
            res.status(500).json({ error: 'Error al registrar usuario' });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validaciones básicas
            if (!email || !password) {
                return res.status(400).json({ 
                    error: 'Datos incompletos',
                    details: {
                        email: !email ? 'El email es requerido' : null,
                        password: !password ? 'La contraseña es requerida' : null
                    }
                });
            }

            // Buscar usuario por email
            const user = await get('SELECT * FROM users WHERE email = ?', [email]);

            if (!user) {
                return res.status(400).json({ 
                    error: 'El email proporcionado no está registrado'
                });
            }

            // Verificar contraseña
            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
                return res.status(400).json({ 
                    error: 'La contraseña es incorrecta'
                });
            }

            // Guardar información del usuario en la sesión
            req.session.userId = user.id;
            req.session.username = user.username;

            res.json({
                message: 'Inicio de sesión exitoso',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            });
        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({ error: 'Error al iniciar sesión' });
        }
    },

    async logout(req, res) {
        try {
            req.session.destroy();
            res.json({ message: 'Sesión cerrada exitosamente' });
        } catch (error) {
            console.error('Error en logout:', error);
            res.status(500).json({ error: 'Error al cerrar sesión' });
        }
    },

    async getCurrentUser(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ error: 'No autorizado' });
            }

            const user = await get(
                'SELECT id, username, email FROM users WHERE id = ?',
                [req.session.userId]
            );

            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.json({ user });
        } catch (error) {
            console.error('Error al obtener usuario actual:', error);
            res.status(500).json({ error: 'Error al obtener información del usuario' });
        }
    }
};

module.exports = userController; 