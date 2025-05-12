document.addEventListener('DOMContentLoaded', function() {
    // Initialize Quill editor
    const quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link', 'image', 'video'],
                ['clean']
            ]
        },
        placeholder: 'Write your post content here...'
    });

    // DOM Elements
    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('dashboard');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const postList = document.getElementById('post-list');
    const postForm = document.getElementById('post-form');
    const newPostBtn = document.getElementById('new-post-btn');
    const deletePostBtn = document.getElementById('delete-post-btn');
    const welcomeScreen = document.getElementById('welcome-screen');
    const postEditorContainer = document.getElementById('post-editor-container');
    
    // Current post state
    let currentPost = null;

    // Check authentication on load
    if (Auth.isAuthenticated()) {
        showDashboard();
        loadPosts();
    } else {
        showLogin();
    }

    // Event Listeners
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    newPostBtn.addEventListener('click', createNewPost);
    postForm.addEventListener('submit', savePost);
    deletePostBtn.addEventListener('click', deleteCurrentPost);

    // Functions
    function showLogin() {
        loginScreen.style.display = 'flex';
        dashboard.style.display = 'none';
    }

    function showDashboard() {
        loginScreen.style.display = 'none';
        dashboard.style.display = 'block';
        welcomeScreen.style.display = 'flex';
        postEditorContainer.style.display = 'none';
    }

    function handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (Auth.login(username, password)) {
            showDashboard();
            loadPosts();
        } else {
            alert('Invalid credentials');
        }
    }

    function handleLogout() {
        Auth.logout();
        showLogin();
    }

    function loadPosts() {
        const posts = BlogDB.getPosts();
        postList.innerHTML = '';
        
        if (posts.length === 0) {
            postList.innerHTML = '<li>No posts yet</li>';
            return;
        }
        
        posts.forEach(post => {
            const li = document.createElement('li');
            li.textContent = post.title;
            li.dataset.id = post.id;
            
            li.addEventListener('click', function() {
                // Remove active class from all items
                document.querySelectorAll('#post-list li').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Add active class to clicked item
                li.classList.add('active');
                
                // Load post for editing
                loadPostForEditing(post.id);
            });
            
            postList.appendChild(li);
        });
    }

    function createNewPost() {
        currentPost = null;
        welcomeScreen.style.display = 'none';
        postEditorContainer.style.display = 'block';
        
        // Reset form
        postForm.reset();
        quill.setContents([{ insert: '\n' }]);
        document.getElementById('post-title').focus();
        
        // Remove active class from all post list items
        document.querySelectorAll('#post-list li').forEach(item => {
            item.classList.remove('active');
        });
    }

    function loadPostForEditing(postId) {
        const post = BlogDB.getPost(postId);
        if (!post) return;
        
        currentPost = post;
        welcomeScreen.style.display = 'none';
        postEditorContainer.style.display = 'block';
        
        // Fill form
        document.getElementById('post-title').value = post.title;
        quill.setContents(quill.clipboard.convert(post.content));
        document.getElementById('post-tags').value = post.tags ? post.tags.join(', ') : '';
    }

    function savePost(e) {
        e.preventDefault();
        
        const title = document.getElementById('post-title').value.trim();
        const content = quill.root.innerHTML;
        const tags = document.getElementById('post-tags').value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
        
        if (!title || !content) {
            alert('Title and content are required');
            return;
        }
        
        const postData = {
            title,
            content,
            tags,
            excerpt: createExcerpt(content),
            author: 'Your Name'
        };
        
        if (currentPost) {
            postData.id = currentPost.id;
        }
        
        BlogDB.savePost(postData);
        loadPosts();
        
        if (!currentPost) {
            // If new post, load it for editing
            const posts = BlogDB.getPosts();
            if (posts.length > 0) {
                loadPostForEditing(posts[0].id);
            }
        }
        
        alert('Post saved successfully!');
    }

    function deleteCurrentPost() {
        if (!currentPost || !confirm('Are you sure you want to delete this post?')) {
            return;
        }
        
        BlogDB.deletePost(currentPost.id);
        loadPosts();
        postForm.reset();
        welcomeScreen.style.display = 'flex';
        postEditorContainer.style.display = 'none';
        currentPost = null;
        
        alert('Post deleted successfully!');
    }

    function createExcerpt(html) {
        // Create a temporary div to parse HTML
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Get text content and trim
        let text = temp.textContent || temp.innerText || '';
        text = text.replace(/\s+/g, ' ').trim();
        
        // Return first 150 characters with ellipsis
        return text.substring(0, 150) + (text.length > 150 ? '...' : '');
    }
});
