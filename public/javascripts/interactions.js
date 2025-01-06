// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeLikes();
    initializeComments();
    initializeMovieReviewForm();
});

// Like functionality
function initializeLikes() {
    document.addEventListener('click', async function(e) {
        const likeLink = e.target.closest('.like-button, .like-btn');
        if (!likeLink) return;
        
        e.preventDefault(); // Prevent the default anchor behavior
        const reviewId = likeLink.dataset.reviewId;
        
        try {
            const response = await fetch(`/reviews/${reviewId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            
            // Update like count and button state
            const likeCount = likeLink.querySelector('.like-count');
            const heartIcon = likeLink.querySelector('.bi');
            
            if (likeCount) likeCount.textContent = data.likes;
            
            if (data.isLiked) {
                heartIcon.classList.replace('bi-heart', 'bi-heart-fill');
            } else {
                heartIcon.classList.replace('bi-heart-fill', 'bi-heart');
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    });
}

// Comment functionality
function initializeComments() {
    // Handle comment submission
    document.addEventListener('submit', async function(e) {
        const commentForm = e.target.closest('.comment-form');
        if (!commentForm) return;
        
        e.preventDefault();
        const reviewId = commentForm.dataset.reviewId;
        const textarea = commentForm.querySelector('textarea');
        const content = textarea.value;

        try {
            const response = await fetch(`/reviews/${reviewId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });
            const data = await response.json();
            
            // Add new comment to the list
            const commentsList = document.querySelector('.comments-list');
            if (commentsList) {
                const newComment = createCommentElement(data.comment, reviewId);
                commentsList.insertBefore(newComment, commentsList.firstChild);
            }
            
            // Clear the form
            commentForm.reset();
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    });

    // Handle comment deletion
    document.addEventListener('click', async function(e) {
        const deleteButton = e.target.closest('.delete-comment');
        if (!deleteButton) return;
        
        e.preventDefault(); // Prevent default if it's a link
        const reviewId = deleteButton.dataset.reviewId;
        const commentId = deleteButton.dataset.commentId;
        
        if (confirm('Are you sure you want to delete this comment?')) {
            try {
                const response = await fetch(`/reviews/${reviewId}/comments/${commentId}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    document.getElementById(`comment-${commentId}`).remove();
                }
            } catch (error) {
                console.error('Error deleting comment:', error);
            }
        }
    });
}

// Movie review form functionality
function initializeMovieReviewForm() {
    // Handle delete review confirmation
    document.addEventListener('click', function(e) {
        const deleteButton = e.target.closest('button[type="submit"]');
        if (!deleteButton || !deleteButton.closest('form[action*="DELETE"]')) return;
        
        e.preventDefault();
        if (confirm('Are you sure you want to delete this review?')) {
            deleteButton.closest('form').submit();
        }
    });
}

// Helper function to create comment HTML element
function createCommentElement(comment, reviewId) {
    const div = document.createElement('div');
    div.className = 'comment mb-3';
    div.id = `comment-${comment._id}`;
    
    div.innerHTML = `
        <div class="d-flex justify-content-between">
            <div>
                <a href="/users/${comment.user._id}" class="fw-bold text-decoration-none">
                    ${comment.user.username}
                </a>
                <small class="text-muted ms-2">
                    ${new Date(comment.createdAt).toLocaleDateString()}
                </small>
            </div>
            <a href="#" class="btn btn-link btn-sm text-danger p-0 delete-comment"
                    data-review-id="${reviewId}"
                    data-comment-id="${comment._id}">
                <i class="bi bi-trash"></i>
            </a>
        </div>
        <div class="mt-1">${comment.content}</div>
    `;
    
    return div;
}
