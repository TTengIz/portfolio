const API_BASE_URL = 'http://localhost:8000';
const ADMIN_PASSWORD = 'admin123';

let educationCount = 0;
let experienceCount = 0;

document.addEventListener('DOMContentLoaded', () => {
    if (!isAuthorized()) {
        showLoginPrompt();
        return;
    }

    loadProfile();
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

async function loadProfile() {
    try {
        const response = await fetch(`${API_BASE_URL}/profile/`);

        if (response.status === 404) {
            return; // Профиль еще не создан
        }

        if (!response.ok) {
            throw new Error('Failed to load profile');
        }

        const profile = await response.json();

        document.getElementById('full-name').value = profile.full_name;
        document.getElementById('age').value = profile.age || '';
        document.getElementById('photo-url').value = profile.photo_url || '';
        document.getElementById('bio').value = profile.bio;
        document.getElementById('goals').value = profile.goals || '';

        // Загружаем образование
        profile.education.forEach(edu => {
            addEducation(edu);
        });

        // Загружаем опыт работы
        profile.experience.forEach(exp => {
            addExperience(exp);
        });

    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

function addEducation(data = null) {
    educationCount++;
    const container = document.getElementById('education-list');
    const div = document.createElement('div');
    div.className = 'admin-form';
    div.style.marginBottom = '1rem';
    div.innerHTML = `
        <h3>Образование #${educationCount}</h3>
        <div class="form-group">
            <label>Учебное заведение</label>
            <input type="text" class="edu-institution" value="${data?.institution || ''}" required>
        </div>
        <div class="form-group">
            <label>Специальность/Степень</label>
            <input type="text" class="edu-degree" value="${data?.degree || ''}">
        </div>
        <div class="form-group">
            <label>Год начала</label>
            <input type="number" class="edu-start" value="${data?.start_year || ''}">
        </div>
        <div class="form-group">
            <label>Год окончания</label>
            <input type="number" class="edu-end" value="${data?.end_year || ''}">
        </div>
        <div class="form-group">
            <label>Описание</label>
            <textarea class="edu-description" rows="2">${data?.description || ''}</textarea>
        </div>
        <button type="button" class="btn-delete" onclick="this.parentElement.remove()">Удалить</button>
    `;
    container.appendChild(div);
}

function addExperience(data = null) {
    experienceCount++;
    const container = document.getElementById('experience-list');
    const div = document.createElement('div');
    div.className = 'admin-form';
    div.style.marginBottom = '1rem';
    div.innerHTML = `
        <h3>Опыт работы #${experienceCount}</h3>
        <div class="form-group">
            <label>Компания</label>
            <input type="text" class="exp-company" value="${data?.company || ''}" required>
        </div>
        <div class="form-group">
            <label>Должность</label>
            <input type="text" class="exp-position" value="${data?.position || ''}" required>
        </div>
        <div class="form-group">
            <label>Дата начала</label>
            <input type="text" class="exp-start" value="${data?.start_date || ''}" placeholder="Янв 2023">
        </div>
        <div class="form-group">
            <label>Дата окончания</label>
            <input type="text" class="exp-end" value="${data?.end_date || ''}" placeholder="По настоящее время">
        </div>
        <div class="form-group">
            <label>
                <input type="checkbox" class="exp-current" ${data?.is_current ? 'checked' : ''}>
                Текущее место работы
            </label>
        </div>
        <div class="form-group">
            <label>Описание</label>
            <textarea class="exp-description" rows="3">${data?.description || ''}</textarea>
        </div>
        <button type="button" class="btn-delete" onclick="this.parentElement.remove()">Удалить</button>
    `;
    container.appendChild(div);
}

function setupForm() {
    const form = document.getElementById('profile-form');
    const photoInput = document.getElementById('photo-file');
    const photoUrlInput = document.getElementById('photo-url');

    // Обработка загрузки фото
    if (photoInput) {
        photoInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch(`${API_BASE_URL}/upload/image/`, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Failed to upload image');
                }

                const data = await response.json();
                photoUrlInput.value = data.url;

                // Показываем превью
                const preview = document.getElementById('photo-preview');
                if (preview) {
                    preview.src = `${API_BASE_URL}${data.url}`;
                    preview.style.display = 'block';
                } else {
                    const img = document.createElement('img');
                    img.id = 'photo-preview';
                    img.src = `${API_BASE_URL}${data.url}`;
                    img.style.maxWidth = '200px';
                    img.style.marginTop = '1rem';
                    img.style.borderRadius = '8px';
                    photoInput.parentElement.appendChild(img);
                }

            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Ошибка загрузки фото');
            }
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Собираем образование
        const education = [];
        document.querySelectorAll('#education-list > div').forEach(div => {
            education.push({
                institution: div.querySelector('.edu-institution').value,
                degree: div.querySelector('.edu-degree').value,
                start_year: parseInt(div.querySelector('.edu-start').value) || null,
                end_year: parseInt(div.querySelector('.edu-end').value) || null,
                description: div.querySelector('.edu-description').value
            });
        });

        // Собираем опыт работы
        const experience = [];
        document.querySelectorAll('#experience-list > div').forEach(div => {
            experience.push({
                company: div.querySelector('.exp-company').value,
                position: div.querySelector('.exp-position').value,
                start_date: div.querySelector('.exp-start').value,
                end_date: div.querySelector('.exp-end').value,
                is_current: div.querySelector('.exp-current').checked,
                description: div.querySelector('.exp-description').value
            });
        });

        const profileData = {
            full_name: document.getElementById('full-name').value,
            age: parseInt(document.getElementById('age').value) || null,
            photo_url: document.getElementById('photo-url').value || null,
            bio: document.getElementById('bio').value,
            goals: document.getElementById('goals').value,
            education,
            experience
        };

        try {
            const checkResponse = await fetch(`${API_BASE_URL}/profile/`, {
                headers: {
                    'X-Admin-Password': ADMIN_PASSWORD
                }
            });

            const method = checkResponse.status === 404 ? 'POST' : 'PUT';

            const response = await fetch(`${API_BASE_URL}/profile/`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Password': ADMIN_PASSWORD
                },
                body: JSON.stringify(profileData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                throw new Error(`Failed to save profile: ${response.status}`);
            }

            const savedProfile = await response.json();
            console.log('Profile saved:', savedProfile);
            alert('Профиль успешно сохранен!');

        } catch (error) {
            console.error('Error saving profile:', error);
            alert(`Ошибка сохранения профиля: ${error.message}`);
        }
    });
}