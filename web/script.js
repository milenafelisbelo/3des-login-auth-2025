document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('loginForm')) {
        setupLoginPage();
    } else if (document.getElementById('logoutBtn')) {
        setupHomePage();
    }
});

function setupLoginPage() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const user = document.getElementById('user').value;
        const psw = document.getElementById('psw').value;
        
        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user, psw })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('jwtToken', data.token);

                window.location.href = 'home.html';
            } else {
                alert('Login falhou: ' + (data.message || 'Credenciais inválidas'));
            }
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            alert('Erro ao conectar com o servidor');
        }
    });
}

function setupHomePage() {
    const logoutBtn = document.getElementById('logoutBtn');
    const postsContainer = document.getElementById('postsContainer');

    const token = localStorage.getItem('jwtToken');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Usuário logado:', payload.name);
    } catch (error) {
        console.error('Erro ao decodificar token:', error);
        localStorage.removeItem('jwtToken');
        window.location.href = 'login.html';
    }

    loadPosts(token);

    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('jwtToken');
        window.location.href = 'login.html';
    });
}

async function loadPosts(token) {
    try {
        const response = await fetch('http://localhost:3000/posts', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const posts = await response.json();
            displayPosts(posts);
        } else if (response.status === 401) {
            localStorage.removeItem('jwtToken');
            window.location.href = 'login.html';
        } else {
            console.error('Erro ao carregar posts:', response.status);
        }
    } catch (error) {
        console.error('Erro ao carregar posts:', error);
    }
}

function displayPosts(posts) {
    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = '';
    
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        
        postElement.innerHTML = `
            <h2>${post.title}</h2>
            <div class="date">${formatDate(post.date)}</div>
            <p>${post.summary}</p>
            <div class="stats"> ${post.views} | ${post.likes}</div>
        `;
        
        postsContainer.appendChild(postElement);
    });
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}