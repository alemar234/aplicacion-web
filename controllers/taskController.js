const Task = require('../models/task');
const List = require('../models/list');

const taskController = {
    async create(req, res) {
        try {
            const { title, description, listId, dueDate } = req.body;

            if (!title || !listId) {
                return res.status(400).json({ error: 'El título y la lista son requeridos' });
            }

            const list = await List.findById(listId);
            if (!list) {
                return res.status(404).json({ error: 'Lista no encontrada' });
            }

            const task = await Task.create({ title, description, listId, dueDate });
            const updatedList = await List.findById(listId);
            const tasks = await Task.findByListId(listId);
            
            res.json({ message: 'Tarea creada exitosamente', list: updatedList, tasks });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getById(req, res) {
        try {
            const { id } = req.params;
            const task = await Task.findById(id);

            if (!task) {
                return res.status(404).json({ error: 'Tarea no encontrada' });
            }

            res.json(task);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getTask(req, res) {
        try {
            const { id } = req.params;
            const task = await Task.findById(id);
            
            if (!task) {
                return res.status(404).json({ error: 'Tarea no encontrada' });
            }

            const comments = await Task.getComments(id);
            const tags = await Task.getTags(id);
            res.json({ task, comments, tags });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const { title, description, status, dueDate } = req.body;

            const task = await Task.findById(id);
            if (!task) {
                return res.status(404).json({ error: 'Tarea no encontrada' });
            }

            const updatedTask = await Task.update(id, { 
                title: title || task.title,
                description: description !== undefined ? description : task.description,
                status: status || task.status,
                dueDate: dueDate || task.dueDate
            });

            const listId = task.list_id;
            const updatedList = await List.findById(listId);
            const tasks = await Task.findByListId(listId);

            res.json({ message: 'Tarea actualizada exitosamente', list: updatedList, tasks });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            const task = await Task.findById(id);

            if (!task) {
                return res.status(404).json({ error: 'Tarea no encontrada' });
            }

            const listId = task.list_id;
            await Task.delete(id);
            
            const updatedList = await List.findById(listId);
            const tasks = await Task.findByListId(listId);

            res.json({ message: 'Tarea eliminada exitosamente', list: updatedList, tasks });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async addComment(req, res) {
        try {
            const { id } = req.params;
            const { content } = req.body;
            const userId = req.session.userId;

            if (!content) {
                return res.status(400).json({ error: 'El contenido es requerido' });
            }

            const task = await Task.findById(id);
            if (!task) {
                return res.status(404).json({ error: 'Tarea no encontrada' });
            }

            await Task.addComment(id, userId, content);
            const comments = await Task.getComments(id);
            res.json({ message: 'Comentario agregado exitosamente', comments });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async addTag(req, res) {
        try {
            const { id } = req.params;
            const { tagId } = req.body;

            const task = await Task.findById(id);
            if (!task) {
                return res.status(404).json({ error: 'Tarea no encontrada' });
            }

            await Task.addTag(id, tagId);
            const tags = await Task.getTags(id);
            res.json({ message: 'Etiqueta agregada exitosamente', tags });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async removeTag(req, res) {
        try {
            const { id, tagId } = req.params;

            const task = await Task.findById(id);
            if (!task) {
                return res.status(404).json({ error: 'Tarea no encontrada' });
            }

            await Task.removeTag(id, tagId);
            const tags = await Task.getTags(id);
            res.json({ message: 'Etiqueta eliminada exitosamente', tags });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = taskController; 