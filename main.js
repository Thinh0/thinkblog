// Blog configuration
const BLOG_CONFIG = {
    title: 'ThinkBlog',
    description: 'A minimal static blog',
    baseUrl: window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '')
};

// State management
let posts = [];
let currentView = 'loading';

// DOM elements
const elements = {
    loading: null,
    postListView: null,
    postDetailView: null,
    notFoundView: null,
    errorView: null,
    searchInput: null,
    postList: null,
    postTitle: null,
    postDate: null,
    postContent: null,
    errorMessage: null
};

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    // Cache DOM elements
    cacheElements();
    
    // Check for placeholder markdown parser
    checkMarkdownParser();
    
    // Load posts manifest
    await loadPosts();
    
    // Set up event listeners
    setupEventListeners();
    
    // Handle initial route
    handleRoute();
});

function cacheElements() {
    elements.loading = document.getElementById('loading');
    elements.postListView = document.getElementById('post-list-view');
    elements.postDetailView = document.getElementById('post-detail-view');
    elements.notFoundView = document.getElementById('not-found-view');
    elements.errorView = document.getElementById('error-view');
    elements.searchInput = document.getElementById('search-input');
    elements.postList = document.getElementById('post-list');
    elements.postTitle = document.getElementById('post-title');
    elements.postDate = document.getElementById('post-date');
    elements.postContent = document.getElementById('post-content');
    elements.errorMessage = document.getElementById('error-message');
}

function checkMarkdownParser() {
    if (window.marked && window.marked.parse && window.marked.parse.toString().includes('s')) {
        console.warn('Markdown parser placeholder detected. Install lib/marked.min.js for full features.');
    }
}

async function loadPosts() {
    try {
        const response = await fetch('posts/index.json');
        if (!response.ok) {
            throw new Error(`Failed to load posts: ${response.status}`);
        }
        posts = await response.json();
    } catch (error) {
        console.error('Error loading posts:', error);
        showError('Failed to load blog posts. Please try again later.');
    }
}

function setupEventListeners() {
    // Search functionality
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', handleSearch);
    }
    
    // Browser navigation
    window.addEventListener('popstate', handleRoute);
}

function handleSearch(event) {
    const query = event.target.value.toLowerCase().trim();
    const filteredPosts = posts.filter(post => 
        post.title.toLowerCase().includes(query) || 
        post.description.toLowerCase().includes(query)
    );
    renderPostList(filteredPosts);
}

function handleRoute() {
    const urlParams = new URLSearchParams(window.location.search);
    const postSlug = urlParams.get('post');
    
    if (postSlug) {
        showPostDetail(postSlug);
    } else {
        showPostList();
    }
}

function showView(viewName) {
    // Hide all views
    Object.values(elements).forEach(el => {
        if (el && el.style) {
            el.style.display = 'none';
        }
    });
    
    // Show the requested view
    const targetElement = elements[viewName + 'View'] || elements[viewName];
    if (targetElement) {
        targetElement.style.display = 'block';
        currentView = viewName;
    }
}

function showPostList() {
    showView('postList');
    renderPostList(posts);
    updatePageMeta(BLOG_CONFIG.title, BLOG_CONFIG.description);
    
    // Focus management for accessibility
    if (elements.searchInput) {
        elements.searchInput.focus();
    }
}

function renderPostList(postsToRender) {
    if (!elements.postList) return;
    
    if (postsToRender.length === 0) {
        elements.postList.innerHTML = '<p class="no-results">No posts found.</p>';
        return;
    }
    
    const postsHtml = postsToRender
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(post => `
            <article class="post-card">
                <h2 class="post-card-title">
                    <a href="?post=${encodeURIComponent(post.slug)}" data-slug="${post.slug}">
                        ${escapeHtml(post.title)}
                    </a>
                </h2>
                <time class="post-card-date" datetime="${post.date}">
                    ${formatDate(post.date)}
                </time>
                <p class="post-card-description">
                    ${escapeHtml(post.description)}
                </p>
            </article>
        `)
        .join('');
    
    elements.postList.innerHTML = postsHtml;
    
    // Add click handlers for SPA navigation
    elements.postList.querySelectorAll('a[data-slug]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const slug = e.currentTarget.dataset.slug;
            navigateToPost(slug);
        });
    });
}

async function showPostDetail(slug) {
    showView('loading');
    
    try {
        // Find post metadata
        const postMeta = posts.find(p => p.slug === slug);
        if (!postMeta) {
            showNotFound();
            return;
        }
        
        // Load post content
        const response = await fetch(`posts/${slug}.md`);
        if (!response.ok) {
            throw new Error(`Post not found: ${response.status}`);
        }
        
        const markdown = await response.text();
        const html = window.marked ? window.marked.parse(markdown) : `<pre>${escapeHtml(markdown)}</pre>`;
        
        // Render post
        if (elements.postTitle) elements.postTitle.textContent = postMeta.title;
        if (elements.postDate) {
            elements.postDate.textContent = formatDate(postMeta.date);
            elements.postDate.setAttribute('datetime', postMeta.date);
        }
        if (elements.postContent) elements.postContent.innerHTML = html;
        
        showView('postDetail');
        updatePageMeta(postMeta.title, postMeta.description);
        
        // Focus management for accessibility
        if (elements.postTitle) {
            elements.postTitle.focus();
            elements.postTitle.scrollIntoView();
        }
        
    } catch (error) {
        console.error('Error loading post:', error);
        showError(`Failed to load post: ${error.message}`);
    }
}

function showNotFound() {
    showView('notFound');
    updatePageMeta('Post Not Found', 'The requested post could not be found.');
}

function showError(message) {
    if (elements.errorMessage) {
        elements.errorMessage.textContent = message;
    }
    showView('error');
    updatePageMeta('Error', 'An error occurred while loading the content.');
}

function navigateToPost(slug) {
    const url = new URL(window.location);
    url.searchParams.set('post', slug);
    history.pushState({ post: slug }, '', url);
    handleRoute();
}

function updatePageMeta(title, description) {
    document.title = title === BLOG_CONFIG.title ? title : `${title} - ${BLOG_CONFIG.title}`;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.setAttribute('content', description);
    }
    
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
        ogTitle.setAttribute('content', title);
    }
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
        ogDescription.setAttribute('content', description);
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
