const BlogDB = {
    // Get all posts
    getPosts() {
        const posts = JSON.parse(localStorage.getItem('blog_posts')) || [];
        return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    
    // Get single post
    getPost(id) {
        const posts = this.getPosts();
        return posts.find(post => post.id === id);
    },
    
    // Create or update post
    savePost(postData) {
        const posts = this.getPosts();
        let post;
        
        if (postData.id) {
            // Update existing post
            const index = posts.findIndex(p => p.id === postData.id);
            if (index !== -1) {
                post = { ...posts[index], ...postData };
                posts[index] = post;
            }
        } else {
            // Create new post
            post = {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                ...postData
            };
            posts.unshift(post);
        }
        
        localStorage.setItem('blog_posts', JSON.stringify(posts));
        return post;
    },
    
    // Delete post
    deletePost(id) {
        const posts = this.getPosts().filter(post => post.id !== id);
        localStorage.setItem('blog_posts', JSON.stringify(posts));
        return true;
    }
};
