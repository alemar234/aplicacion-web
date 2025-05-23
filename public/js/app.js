let currentListId = null;

// Cargar información del usuario
async function loadUserInfo() {
    try {
        const response = await fetch('/api/users/me');
        if (response.ok) {
            const { user } = await response.json();
            document.getElementById('username').textContent = user.username;
        }
    } catch (error) {
        showAlert('Error al cargar información del usuario', 'error');
    }
}

// Cargar listas
async function loadLists() {
    try {
        const response = await fetch('/api/lists');
        if (response.ok) {
            const { lists } = await response.json();
            const container = document.getElementById('listContainer');
            container.innerHTML = '';
            
            lists.forEach(list => {
                const listElement = document.createElement('div');
                listElement.className = 'list-item';
                listElement.dataset.listId = list.id;
                listElement.innerHTML = `
                    <span class="list-item-title">${list.title}</span>
                    <span class="list-item-count">0 tareas</span>
                `;
                listElement.onclick = () => loadList(list.id);
                animateNewElement(listElement);
                container.appendChild(listElement);
            });
        }
    } catch (error) {
        showAlert('Error al cargar las listas', 'error');
    }
}

// Cargar una lista específica
async function loadList(listId) {
    try {
        const response = await fetch(`/api/lists/${listId}`);
        if (response.ok) {
            const { list, tasks } = await response.json();
            currentListId = list.id;
            
            document.getElementById('welcomeMessage').style.display = 'none';
            document.getElementById('listContent').style.display = 'block';
            document.getElementById('listTitle').textContent = list.title;
            
            const taskList = document.getElementById('taskList');
            taskList.innerHTML = '';
            
            tasks.forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.className = `task-item ${task.status}`;
                taskElement.dataset.taskId = task.id;
                taskElement.innerHTML = `
                    <div class="task-header">
                        <input type="checkbox" ${task.status === 'completed' ? 'checked' : ''} 
                               onchange="updateTaskStatus(${task.id}, this.checked)">
                        <span class="task-title">${task.title}</span>
                    </div>
                    <div class="task-actions">
                        <button onclick="editTask(${task.id})" class="btn-icon">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteTask(${task.id})" class="btn-icon">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                animateNewElement(taskElement);
                taskList.appendChild(taskElement);
            });
        }
    } catch (error) {
        showAlert('Error al cargar la lista', 'error');
    }
}

// Crear o actualizar lista
document.getElementById('listForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const listId = document.getElementById('listId').value;
    const title = document.getElementById('listTitleInput').value;
    const description = document.getElementById('listDescription').value;
    
    try {
        const url = listId ? `/api/lists/${listId}` : '/api/lists';
        const method = listId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description })
        });
        
        if (response.ok) {
            closeModal('listModal');
            loadLists();
            if (listId) {
                loadList(listId);
            }
            showAlert(`Lista ${listId ? 'actualizada' : 'creada'} exitosamente`);
        } else {
            const data = await response.json();
            showAlert(data.error, 'error');
        }
    } catch (error) {
        showAlert('Error al guardar la lista', 'error');
    }
});

// Crear o actualizar tarea
document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const taskId = document.getElementById('taskId').value;
    const title = document.getElementById('taskTitleInput').value;
    const description = document.getElementById('taskDescription').value;
    const dueDate = document.getElementById('taskDueDate').value;
    
    try {
        const url = taskId ? `/api/tasks/${taskId}` : '/api/tasks';
        const method = taskId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                description,
                dueDate,
                listId: currentListId
            })
        });
        
        if (response.ok) {
            closeModal('taskModal');
            loadList(currentListId);
            showAlert(`Tarea ${taskId ? 'actualizada' : 'creada'} exitosamente`);
        } else {
            const data = await response.json();
            showAlert(data.error, 'error');
        }
    } catch (error) {
        showAlert('Error al guardar la tarea', 'error');
    }
});

// Funciones para los modales
function openModal(modalId, isEdit = false, data = null) {
    const modal = document.getElementById(modalId);
    const form = modal.querySelector('form');
    const title = modal.querySelector('h3');
    
    form.reset();
    
    if (modalId === 'listModal') {
        document.getElementById('listId').value = data ? data.id : '';
        if (data) {
            document.getElementById('listTitleInput').value = data.title;
            document.getElementById('listDescription').value = data.description;
        }
        title.textContent = isEdit ? 'Editar Lista' : 'Nueva Lista';
    } else if (modalId === 'taskModal') {
        document.getElementById('taskId').value = data ? data.id : '';
        if (data) {
            document.getElementById('taskTitleInput').value = data.title;
            document.getElementById('taskDescription').value = data.description;
            document.getElementById('taskDueDate').value = data.due_date;
        }
        title.textContent = isEdit ? 'Editar Tarea' : 'Nueva Tarea';
    }
    
    modal.style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Event Listeners
document.getElementById('newListBtn').addEventListener('click', () => {
    openModal('listModal');
});

document.getElementById('newTaskBtn').addEventListener('click', () => {
    if (!currentListId) {
        showAlert('Por favor, selecciona una lista primero', 'error');
        return;
    }
    openModal('taskModal');
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        const response = await fetch('/api/users/logout', { method: 'POST' });
        if (response.ok) {
            window.location.href = '/';
        }
    } catch (error) {
        showAlert('Error al cerrar sesión', 'error');
    }
});

// Funciones para gestionar tareas
async function editTask(taskId) {
    try {
        const response = await fetch(`/api/tasks/${taskId}`);
        if (response.ok) {
            const task = await response.json();
            openModal('taskModal', true, task);
        }
    } catch (error) {
        showAlert('Error al cargar la tarea', 'error');
    }
}

async function updateTaskStatus(taskId, completed) {
    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: completed ? 'completed' : 'pending'
            })
        });

        if (response.ok) {
            loadList(currentListId);
            showAlert('Estado de la tarea actualizado', 'success');
        } else {
            const data = await response.json();
            showAlert(data.error || 'Error al actualizar el estado de la tarea', 'error');
        }
    } catch (error) {
        showAlert('Error al actualizar el estado de la tarea', 'error');
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadLists();
}); 