// Función para mostrar alertas
function showAlert(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    document.body.appendChild(alert);

    // Remover la alerta después de 3 segundos
    setTimeout(() => {
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

// Interceptar los eventos de formularios para mostrar alertas
document.getElementById('listForm')?.addEventListener('submit', async (e) => {
    const isEdit = document.getElementById('listId').value;
    const action = isEdit ? 'actualizada' : 'creada';
    
    try {
        // ... código existente del submit ...
        showAlert(`Lista ${action} exitosamente`);
    } catch (error) {
        showAlert(error.message, 'error');
    }
});

document.getElementById('taskForm')?.addEventListener('submit', async (e) => {
    const isEdit = document.getElementById('taskId').value;
    const action = isEdit ? 'actualizada' : 'creada';
    
    try {
        // ... código existente del submit ...
        showAlert(`Tarea ${action} exitosamente`);
    } catch (error) {
        showAlert(error.message, 'error');
    }
});

// Interceptar eliminación de tareas y listas
async function deleteTask(taskId) {
    if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
                taskElement.style.animation = 'slideOut 0.3s ease-out forwards';
                setTimeout(() => taskElement.remove(), 300);
                showAlert('Tarea eliminada exitosamente');
            }
        } catch (error) {
            showAlert(error.message, 'error');
        }
    }
}

async function deleteList(listId) {
    if (confirm('¿Estás seguro de que deseas eliminar esta lista?')) {
        try {
            const response = await fetch(`/api/lists/${listId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                const listElement = document.querySelector(`[data-list-id="${listId}"]`);
                listElement.style.animation = 'slideOut 0.3s ease-out forwards';
                setTimeout(() => listElement.remove(), 300);
                showAlert('Lista eliminada exitosamente');
            }
        } catch (error) {
            showAlert(error.message, 'error');
        }
    }
}

// Animación para nuevos elementos
function animateNewElement(element) {
    element.style.animation = 'slideIn 0.3s ease-out';
}

// Aplicar animaciones a los elementos cuando se cargan
document.addEventListener('DOMContentLoaded', () => {
    const tasks = document.querySelectorAll('.task-item');
    tasks.forEach(task => {
        task.style.animation = 'slideIn 0.3s ease-out';
    });
}); 