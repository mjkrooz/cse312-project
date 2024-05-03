window.onload = () => {
    const jsPlaceholder = document.getElementById('js-placeholder');

    if (jsPlaceholder !== undefined && jsPlaceholder !== null) {

        jsPlaceholder.innerHTML = 'No blog posts exist';
    }

    getScheduledPosts();

    setTimeout(updateScheduledPostTimers, 1000);
};

let scheduledPosts = [];

function getScheduledPosts() {
    
    fetch('/api/v1/posts/scheduled')
    .then(response => {
        if (!response.ok) {
            throw new Error('RESPONSE NOT OK');
        }

        return response.json();
    })
    .then(posts => {

        const postsContainer = document.getElementById('scheduledPosts');
        postsContainer.innerHTML = '';

        // Add the posts to the page.

        posts.forEach(post => {
            let buffer = '<li id="scheduled-post-' + post._id + '">';

            buffer = buffer + '<b>' + post.title + '</b> releases in <span class="seconds_remaining">' + (Math.ceil((post.scheduled - Date.now()) / 1000)) + '</span> seconds.';
            
            buffer = buffer + '</li>';

            postsContainer.innerHTML += buffer;

            scheduledPosts.push({'id': post._id, 'el': 'scheduled-post-' + post._id});
        });
    })
    .catch(error =>{
        console.error('Error', error);
    });
}

function updateScheduledPostTimers() {

    scheduledPosts.forEach((post) => {

        fetch('/api/v1/posts/scheduled/' + post.id + '/remaining-time')
        .then(response => {
            if (!response.ok) {
                throw new Error('RESPONSE NOT OK');
            }
    
            return response.json();
        })
        .then(json => {
            const el = document.querySelector('#' + post.el + ' > .seconds_remaining');
            el.innerHTML = json.remaining;

            if (json.remaining === 0) {

                window.location = '/';
            }
        })
        .catch(error =>{
            console.error('Error', error);
        });
    });

    setTimeout(updateScheduledPostTimers, 1000);
}

function addCommentToPost(postId, csrfToken, socket) {

    const data = {};
    const comment = document.getElementById('addComment-' + postId);

    data.postId = postId;
    data.comment = comment.value;
    data.csrfToken = csrfToken;

    // Emit the comment. Elsewhere, the comment will be collected (by all clients) and displayed.

    socket.emit('comment', data)

    // Empty the input box.

    comment.value = '';
    
    // The following was used prior to the implementation of websockets.

    /*fetch('/api/v1/posts/' + postId + '/comments',{
        method:'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('RESPONSE NOT OK');
        }
        console.log('response ok');
        return response.json();
    })
    .then(data => {
        console.log('Success', data);
        //alert('Comment created!');
        //window.location = '/';
    })
    .catch(error =>{
        console.error('Error', error);
        alert('Failed to create comment');
    });*/
}

function deleteComment(commentId, csrfToken, socket) {

    const data = {};

    data.csrfToken = csrfToken;

    fetch('/api/v1/comments/' + commentId,{
        method:'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('RESPONSE NOT OK');
        }
        alert('Comment deleted');
        //window.location = '/';

        // Emit on websocket so clients can have the comment deleted from their UIs.

        socket.emit('deleteComment', commentId);
    })
    .catch(error =>{
        console.error('Error', error);
        alert('Failed to delete comment');
    });
}

function deletePost(postId, csrfToken,socket) {

    const data = {};
    data.csrfToken = csrfToken;


    if (confirm("Are you sure you want to delete this post?")) {

        fetch(`/api/v1/posts/`+postId, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete post');
            }
            alert('Post Deleted')

            window.location = '/';
        })
        
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to delete post');
        });
    }
}

function addReportToComment(commentId, csrfToken) {

    const data = {};
    const report = document.getElementById('reportComment-' + commentId);

    data.report = report.value;
    data.csrfToken = csrfToken;

    fetch('/api/v1/comments/' + commentId + '/report',{
        method:'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('RESPONSE NOT OK');
        }
        console.log('response ok');
        return response.json();
    })
    .then(data => {
        console.log('Success', data);
        alert('Report created!');
        window.location = '/';
    })
    .catch(error =>{
        console.error('Error', error);
        alert('Failed to create report');
    });
}

