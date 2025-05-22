const { get, run, query } = require('./db');

class Task {
    static async create(data) {
        const { title, description, listId, dueDate = null } = data;
        try {
            const result = await run(
                'INSERT INTO tasks (title, description, list_id, due_date) VALUES (?, ?, ?, ?)',
                [title, description, listId, dueDate]
            );
            return await this.findById(result.id);
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        return await get(
            `SELECT t.*, COUNT(c.id) as comment_count 
             FROM tasks t 
             LEFT JOIN comments c ON t.id = c.task_id 
             WHERE t.id = ?
             GROUP BY t.id`,
            [id]
        );
    }

    static async findByListId(listId) {
        return await query(
            `SELECT t.*, COUNT(c.id) as comment_count 
             FROM tasks t 
             LEFT JOIN comments c ON t.id = c.task_id 
             WHERE t.list_id = ?
             GROUP BY t.id
             ORDER BY t.created_at DESC`,
            [listId]
        );
    }

    static async update(id, data) {
        const { title, description, status, dueDate } = data;
        try {
            await run(
                'UPDATE tasks SET title = ?, description = ?, status = ?, due_date = ? WHERE id = ?',
                [title, description, status, dueDate, id]
            );
            return await this.findById(id);
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            await run('DELETE FROM comments WHERE task_id = ?', [id]);
            await run('DELETE FROM task_tags WHERE task_id = ?', [id]);
            return await run('DELETE FROM tasks WHERE id = ?', [id]);
        } catch (error) {
            throw error;
        }
    }

    static async addComment(taskId, userId, content) {
        try {
            return await run(
                'INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)',
                [taskId, userId, content]
            );
        } catch (error) {
            throw error;
        }
    }

    static async getComments(taskId) {
        return await query(
            `SELECT c.*, u.username 
             FROM comments c 
             JOIN users u ON c.user_id = u.id 
             WHERE c.task_id = ? 
             ORDER BY c.created_at DESC`,
            [taskId]
        );
    }

    static async addTag(taskId, tagId) {
        try {
            return await run(
                'INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)',
                [taskId, tagId]
            );
        } catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT') {
                throw new Error('La etiqueta ya está asignada a esta tarea');
            }
            throw error;
        }
    }

    static async removeTag(taskId, tagId) {
        return await run(
            'DELETE FROM task_tags WHERE task_id = ? AND tag_id = ?',
            [taskId, tagId]
        );
    }

    static async getTags(taskId) {
        return await query(
            `SELECT t.* 
             FROM tags t 
             JOIN task_tags tt ON t.id = tt.tag_id 
             WHERE tt.task_id = ?`,
            [taskId]
        );
    }
}

module.exports = Task; 