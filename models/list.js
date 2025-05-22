const { get, run, query } = require('./db');

class List {
    static async create(title, description, ownerId) {
        try {
            const result = await run(
                'INSERT INTO lists (title, description, owner_id) VALUES (?, ?, ?)',
                [title, description, ownerId]
            );
            return await this.findById(result.id);
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        return await get(
            'SELECT * FROM lists WHERE id = ?',
            [id]
        );
    }

    static async findByOwnerId(ownerId) {
        return await query(
            'SELECT * FROM lists WHERE owner_id = ? ORDER BY created_at DESC',
            [ownerId]
        );
    }

    static async update(id, data) {
        const { title, description } = data;
        try {
            await run(
                'UPDATE lists SET title = ?, description = ? WHERE id = ?',
                [title, description, id]
            );
            return await this.findById(id);
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            await run('DELETE FROM tasks WHERE list_id = ?', [id]);
            await run('DELETE FROM shared_lists WHERE list_id = ?', [id]);
            return await run('DELETE FROM lists WHERE id = ?', [id]);
        } catch (error) {
            throw error;
        }
    }

    static async getSharedUsers(listId) {
        return await query(
            `SELECT u.id, u.username, u.email, sl.permission
             FROM users u
             JOIN shared_lists sl ON u.id = sl.user_id
             WHERE sl.list_id = ?`,
            [listId]
        );
    }

    static async share(listId, userId, permission = 'read') {
        try {
            return await run(
                'INSERT INTO shared_lists (list_id, user_id, permission) VALUES (?, ?, ?)',
                [listId, userId, permission]
            );
        } catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT') {
                throw new Error('La lista ya está compartida con este usuario');
            }
            throw error;
        }
    }

    static async updatePermission(listId, userId, permission) {
        return await run(
            'UPDATE shared_lists SET permission = ? WHERE list_id = ? AND user_id = ?',
            [permission, listId, userId]
        );
    }

    static async removeShare(listId, userId) {
        return await run(
            'DELETE FROM shared_lists WHERE list_id = ? AND user_id = ?',
            [listId, userId]
        );
    }
}

module.exports = List; 