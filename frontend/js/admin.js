const API_BASE_URL = 'http://localhost:8000';
const ADMIN_PASSWORD = 'admin123';

// Проверка авторизации при загрузке
document.addEventListener('DOMContentLoaded', () => {
    if (!isAuthorized()) {
        showLoginPrompt();
        return;
    }

    loadProjects();
    setupForm();
    setupLogout();
});

function isAuthorized() {
    return localStorage.getItem('admin_auth') === 'true';
}

function showLoginPrompt() {
    const password = prompt('Введите пароль администратора:');
    if (password === ADMIN_PASSWORD) {
        localStorage.setItem('admin_auth', 'true');
        location.reload();
    } else {
        alert('Неверный пароль!');
        window.location.href = 'index.html';
    }
}

function setupLogout() {
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('admin_auth');
        window.location.href = 'index.html';
    });
}

async function loadProjects() {
    const container = document.getElementById('projects-list');

    try {
        const response = await fetch(`${API_BASE_URL}/projects/`);
        const projects = await response.json();

        if (projects.length === 0) {
            container.innerHTML = '<p class="loading">Нет проектов</p>';
            return;
        }

        container.innerHTML = projects.map(project => `
            <div class="admin-project-card">
                <div class="admin-project-info">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                </div>
                <div class="admin-project-actions">
                    <button class="btn-edit" onclick="editProject(${project.id})">Редактировать</button>
                    <button class="btn-delete" onclick="deleteProject(${project.id})">Удалить</button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading projects:', error);
        container.innerHTML = '<p class="loading">Ошибка загрузки</p>';
    }
}

function setupForm() {
    const form = document.getElementById('project-form');
    const cancelBtn = document.getElementById('cancel-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const projectId = document.getElementById('project-id').value;
        const formData = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            tech_stack: document.getElementById('tech-stack').value,
            github_url: document.getElementById('github-url').value || null,
            demo_url: document.getElementById('demo-url').value || null
        };

        try {
            const url = projectId
                ? `${API_BASE_URL}/projects/${projectId}`
                : `${API_BASE_URL}/projects/`;

            const method = projectId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Password': ADMIN_PASSWORD
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to save project');
            }

            resetForm();
            loadProjects();

        } catch (error) {
            console.error('Error saving project:', error);
            alert('Ошибка сохранения проекта');
        }
    });

    cancelBtn.addEventListener('click', resetForm);
}

function editProject(projectId) {
    fetch(`${API_BASE_URL}/projects/${projectId}`)
        .then(res => res.json())
        .then(project => {
            document.getElementById('project-id').value = project.id;
            document.getElementById('title').value = project.title;
            document.getElementById('description').value = project.description;
            document.getElementById('tech-stack').value = project.tech_stack;
            document.getElementById('github-url').value = project.github_url || '';
            document.getElementById('demo-url').value = project.demo_url || '';

            document.getElementById('form-title').textContent = 'Редактировать проект';
            document.getElementById('submit-btn').textContent = 'Сохранить';
            document.getElementById('cancel-btn').style.display = 'inline-block';
        });
}

async function deleteProject(projectId) {
    if (!confirm('Удалить проект?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
            method: 'DELETE',
            headers: {
                'X-Admin-Password': ADMIN_PASSWORD
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete project');
        }

        loadProjects();

    } catch (error) {
        console.error('Error deleting project:', error);
        alert('Ошибка удаления проекта');
    }
}

function resetForm() {
    document.getElementById('project-form').reset();
    document.getElementById('project-id').value = '';
    document.getElementById('form-title').textContent = 'Добавить проект';
    document.getElementById('submit-btn').textContent = 'Создать';
    document.getElementById('cancel-btn').style.display = 'none';
}