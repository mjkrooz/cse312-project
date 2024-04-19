window.onload = () => {
    document.getElementById('js-placeholder').innerHTML = 'No blog posts exist';
};

function addCommentToPost(postId, csrfToken,socket) {

    const data = {};
    const comment = document.getElementById('addComment-' + postId);

    data.comment = comment.value;
    data.csrfToken = csrfToken;

    socket.emit('comment',data)
    
    

    fetch('/api/v1/posts/' + postId + '/comments',{
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
        alert('Comment created!');
        window.location = '/';
    })
    .catch(error =>{
        console.error('Error', error);
        alert('Failed to create comment');
    });
}

function deleteComment(commentId, csrfToken) {

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
        window.location = '/';
    })
    .catch(error =>{
        console.error('Error', error);
        alert('Failed to delete comment');
    });
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