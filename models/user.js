const { get, run } = require('./db');
const bcrypt = require('bcryptjs');

class User {
    static async create(username, password, email) {
        const hashedPassword = await bcrypt.hash(password, 10);
        try {
            const result = await run(
                'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
                [username, hashedPassword, email]
            );
            return result.id;
        } catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT') {
                throw new Error('El nombre de usuario o email ya existe');
            }
            throw error;
        }
    }

    static async findById(id) {
        return await get(
            'SELECT id, username, email, created_at FROM users WHERE id = ?',
            [id]
        );
    }

    static async findByUsername(username) {
        return await get(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
    }

    static async authenticate(username, password) {
        const user = await this.findByUsername(username);
        if (!user) {
            return null;
        }
        
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return null;
        }

        // No devolver el hash de la contraseña
        delete user.password;
        return user;
    }

    static async update(id, data) {
        const { username, email } = data;
        try {
            await run(
                'UPDATE users SET username = ?, email = ? WHERE id = ?',
                [username, email, id]
            );
            return await this.findById(id);
        } catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT') {
                throw new Error('El nombre de usuario o email ya existe');
            }
            throw error;
        }
    }

    static async changePassword(id, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        return await run(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, id]
        );
    }
}

module.exports = User; 