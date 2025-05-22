const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const path = require('path');

const userRoutes = require('./routes/userRoutes');
const listRoutes = require('./routes/listRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// Configuración de middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configuración de sesiones
app.use(session({
    secret: 'tu_secreto_aqui',
    resave: false,
    saveUninitialized: false
}));

// Rutas de la API
app.use('/api/users', userRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/tasks', taskRoutes);

// Rutas de vistas
app.get('/', (req, res) => {
    if (req.session.userId) {
        res.redirect('/dashboard');
    } else {
        res.render('auth');
    }
});

app.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }
    res.render('dashboard');
});

// Manejo de errores 404
app.use((req, res, next) => {
    res.status(404).render('404');
});

// Manejo de errores generales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
}); 