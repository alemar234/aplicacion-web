const List = require('../models/list');
const Task = require('../models/task');

const listController = {
    async create(req, res) {
        try {
            const { title, description } = req.body;
            const ownerId = req.session.userId;

            if (!title) {
                return res.status(400).json({ error: 'El título es requerido' });
            }

            const list = await List.create(title, description, ownerId);
            res.json({ message: 'Lista creada exitosamente', list });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getLists(req, res) {
        try {
            const userId = req.session.userId;
            const lists = await List.findByOwnerId(userId);
            res.json({ lists });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getList(req, res) {
        try {
            const { id } = req.params;
            const list = await List.findById(id);
            
            if (!list) {
                return res.status(404).json({ error: 'Lista no encontrada' });
            }

            const tasks = await Task.findByListId(id);
            res.json({ list, tasks });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const { title, description } = req.body;

            if (!title) {
                return res.status(400).json({ error: 'El título es requerido' });
            }

            const list = await List.findById(id);
            if (!list) {
                return res.status(404).json({ error: 'Lista no encontrada' });
            }

            if (list.owner_id !== req.session.userId) {
                return res.status(403).json({ error: 'No autorizado' });
            }

            const updatedList = await List.update(id, { title, description });
            res.json({ message: 'Lista actualizada exitosamente', list: updatedList });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            const list = await List.findById(id);

            if (!list) {
                return res.status(404).json({ error: 'Lista no encontrada' });
            }

            if (list.owner_id !== req.session.userId) {
                return res.status(403).json({ error: 'No autorizado' });
            }

            await List.delete(id);
            res.json({ message: 'Lista eliminada exitosamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async share(req, res) {
        try {
            const { id } = req.params;
            const { userId, permission } = req.body;

            const list = await List.findById(id);
            if (!list) {
                return res.status(404).json({ error: 'Lista no encontrada' });
            }

            if (list.owner_id !== req.session.userId) {
                return res.status(403).json({ error: 'No autorizado' });
            }

            await List.share(id, userId, permission);
            res.json({ message: 'Lista compartida exitosamente' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};

module.exports = listController; 