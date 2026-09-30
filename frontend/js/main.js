// Конфигурация API
const API_BASE_URL = 'http://localhost:8000';

// Навыки
const skills = [
    'Python', 'FastAPI', 'PostgreSQL', 'SQLAlchemy',
    'Docker', 'Git', 'REST API', 'JavaScript'
];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    loadProjects();
    renderSkills();
    setupContactForm();
    setupSmoothScroll();
});

// Загрузка профиля
async function loadProfile() {
    const container = document.getElementById('about-content');
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE_URL}/profile/`);

        if (!response.ok) {
            throw new Error('Failed to load profile');
        }

        const profile = await response.json();
        console.log('Loaded profile:', profile);

        const photoHtml = profile.photo_url
            ? `<img src="${API_BASE_URL}${profile.photo_url}" alt="${profile.full_name}" class="profile-photo">`
            : '<div class="profile-photo-placeholder">Нет фото</div>';

        container.innerHTML = `
            <div class="profile-header">
                ${photoHtml}
                <div class="profile-info">
                    <h3>${profile.full_name}</h3>
                    ${profile.age ? `<p class="profile-age">${profile.age} лет</p>` : ''}
                    <p class="profile-bio">${profile.bio || 'Информация не указана'}</p>
                </div>
            </div>

            ${profile.goals ? `
                <div class="profile-section">
                    <h4>Цели</h4>
                    <p>${profile.goals}</p>
                </div>
            ` : ''}

            ${profile.education && profile.education.length > 0 ? `
                <div class="profile-section">
                    <h4>Образование</h4>
                    <div class="timeline">
                        ${profile.education.map(edu => `
                            <div class="timeline-item">
                                <div class="timeline-year">${edu.start_year || ''}${edu.end_year ? ` - ${edu.end_year}` : ''}</div>
                                <div class="timeline-content">
                                    <h5>${edu.institution}</h5>
                                    ${edu.degree ? `<p class="timeline-degree">${edu.degree}</p>` : ''}
                                    ${edu.description ? `<p>${edu.description}</p>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            ${profile.experience && profile.experience.length > 0 ? `
                <div class="profile-section">
                    <h4>Опыт работы</h4>
                    <div class="timeline">
                        ${profile.experience.map(exp => `
                            <div class="timeline-item">
                                <div class="timeline-year">${exp.start_date || ''}${exp.end_date ? ` - ${exp.end_date}` : ''}</div>
                                <div class="timeline-content">
                                    <h5>${exp.position} ${exp.is_current ? '<span class="current-badge">Текущее</span>' : ''}</h5>
                                    <p class="timeline-company">${exp.company}</p>
                                    ${exp.description ? `<p>${exp.description}</p>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        `;

    } catch (error) {
        console.error('Error loading profile:', error);
        container.innerHTML = `
            <div class="profile-header">
                <div class="profile-info">
                    <h3>Информация о профиле не найдена</h3>
                    <p>Добавьте информацию через <a href="admin-profile.html">админ-панель</a></p>
                </div>
            </div>
        `;
    }
}

// Рендер навыков
function renderSkills() {
    const skillsContainer = document.getElementById('skills');
    if (!skillsContainer) return;

    skillsContainer.innerHTML = skills
        .map(skill => `<span class="skill-tag">${skill}</span>`)
        .join('');
}

// Загрузка проектов
async function loadProjects() {
    const container = document.getElementById('projects-container');
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE_URL}/projects/`);

        if (!response.ok) {
            throw new Error('Failed to load projects');
        }

        const projects = await response.json();

        if (projects.length === 0) {
            container.innerHTML = '<p class="loading">Пока нет проектов. Добавь первый!</p>';
            return;
        }

        container.innerHTML = projects.map(project => `
            <div class="project-card">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="project-tech">
                    ${project.tech_stack.split(',').map(tech =>
                        `<span class="tech-badge">${tech.trim()}</span>`
                    ).join('')}
                </div>
                <div class="project-links">
                    ${project.github_url ? `<a href="${project.github_url}" target="_blank">GitHub ↗</a>` : ''}
                    ${project.demo_url ? `<a href="${project.demo_url}" target="_blank">Demo ↗</a>` : ''}
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading projects:', error);
        container.innerHTML = '<p class="loading">Ошибка загрузки проектов. Убедитесь, что API запущен.</p>';
    }
}

// Настройка формы контактов
function setupContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const messageDiv = document.getElementById('form-message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/contact/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            messageDiv.textContent = 'Сообщение успешно отправлено!';
            messageDiv.className = 'form-message success';
            form.reset();

        } catch (error) {
            console.error('Error sending message:', error);
            messageDiv.textContent = 'Ошибка отправки. Попробуйте позже.';
            messageDiv.className = 'form-message error';
        }

        setTimeout(() => {
            messageDiv.className = 'form-message';
        }, 5000);
    });
}

// Плавная прокрутка
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}