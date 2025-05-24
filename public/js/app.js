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
                    <span class="list-item-count">${list.task_count || 0} tareas</span>
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
                const taskElement = createTaskElement(task);
                animateNewElement(taskElement);
                taskList.appendChild(taskElement);
            });
        } else {
            const data = await response.json();
            showAlert(data.error || 'Error al cargar la lista', 'error');
        }
    } catch (error) {
        showAlert('Error al cargar la lista', 'error');
    }
}

// Crear elemento de tarea
function createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.className = `task-item ${task.status}`;
    taskElement.dataset.taskId = task.id;
    taskElement.innerHTML = `
        <div class="task-header">
            <input type="checkbox" ${task.status === 'completed' ? 'checked' : ''}>
            <span class="task-title">${task.title}</span>
        </div>
        <div class="task-description">${task.description || ''}</div>
        <div class="task-actions">
            <button class="btn-icon edit-task" title="Editar tarea">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon delete-task" title="Eliminar tarea">
                <i class="fas fa-trash"></i>
            </button>
            <button class="btn-icon share-task" title="Compartir tarea">
                <i class="fas fa-share"></i>
            </button>
        </div>
    `;

    // Agregar event listeners
    const checkbox = taskElement.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', () => updateTaskStatus(task.id, checkbox.checked));

    const editBtn = taskElement.querySelector('.edit-task');
    editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        editTask(task.id);
    });

    const deleteBtn = taskElement.querySelector('.delete-task');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTask(task.id);
    });

    const shareBtn = taskElement.querySelector('.share-task');
    shareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        shareTask(task.id);
    });

    return taskElement;
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
            const data = await response.json();
            closeModal('taskModal');
            
            // Actualizar la lista con las nuevas tareas
            document.getElementById('listTitle').textContent = data.list.title;
            const taskList = document.getElementById('taskList');
            taskList.innerHTML = '';
            
            data.tasks.forEach(task => {
                const taskElement = createTaskElement(task);
                animateNewElement(taskElement);
                taskList.appendChild(taskElement);
            });
            
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
            document.getElementById('taskDueDate').value = data.due_date || '';
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

document.getElementById('newTaskBtn').addEventListener('click', createTask);

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
async function createTask() {
    if (!currentListId) {
        showAlert('Por favor, selecciona una lista primero', 'error');
        return;
    }
    openModal('taskModal');
}

async function editTask(taskId) {
    try {
        const response = await fetch(`/api/tasks/${taskId}`);
        if (response.ok) {
            const task = await response.json();
            openModal('taskModal', true, task);
        } else {
            const data = await response.json();
            showAlert(data.error || 'Error al cargar la tarea', 'error');
        }
    } catch (error) {
        showAlert('Error al cargar la tarea', 'error');
    }
}

async function deleteTask(taskId) {
    try {
        if (!confirm('¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.')) {
            return;
        }

        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            const data = await response.json();
            
            // Actualizar la lista con las tareas restantes
            document.getElementById('listTitle').textContent = data.list.title;
            const taskList = document.getElementById('taskList');
            taskList.innerHTML = '';
            
            data.tasks.forEach(task => {
                const taskElement = createTaskElement(task);
                animateNewElement(taskElement);
                taskList.appendChild(taskElement);
            });
            
            showAlert('Tarea eliminada exitosamente');
        } else {
            const data = await response.json();
            showAlert(data.error || 'Error al eliminar la tarea', 'error');
        }
    } catch (error) {
        showAlert('Error al eliminar la tarea', 'error');
    }
}

async function updateTaskStatus(taskId, completed) {
    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: completed ? 'completed' : 'pending'
            })
        });

        if (response.ok) {
            const data = await response.json();
            
            // Actualizar la lista con las tareas actualizadas
            document.getElementById('listTitle').textContent = data.list.title;
            const taskList = document.getElementById('taskList');
            taskList.innerHTML = '';
            
            data.tasks.forEach(task => {
                const taskElement = createTaskElement(task);
                animateNewElement(taskElement);
                taskList.appendChild(taskElement);
            });
            
            showAlert('Estado de la tarea actualizado');
        } else {
            const data = await response.json();
            showAlert(data.error || 'Error al actualizar el estado de la tarea', 'error');
        }
    } catch (error) {
        showAlert('Error al actualizar el estado de la tarea', 'error');
    }
}

async function shareTask(taskId) {
    const taskUrl = `${window.location.origin}/tasks/${taskId}`;
    try {
        await navigator.clipboard.writeText(taskUrl);
        showAlert('Enlace de la tarea copiado al portapapeles');
    } catch (error) {
        showAlert('Error al compartir la tarea', 'error');
    }
}

function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alertContainer') || createAlertContainer();
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.textContent = message;
    
    alertContainer.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
}

function createAlertContainer() {
    const container = document.createElement('div');
    container.id = 'alertContainer';
    document.body.appendChild(container);
    return container;
}

function animateNewElement(element) {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    setTimeout(() => {
        element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }, 10);
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadLists();
}); 