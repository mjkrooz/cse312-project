function addCommentToPost(postId) {

    const data = {};
    const comment = document.getElementById('addComment-' + postId);

    data.comment = comment.value;

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

function deleteComment(commentId) {

    fetch('/api/v1/comments/' + commentId,{
        method:'DELETE'
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

function addReportToComment(commentId) {

    const data = {};
    const report = document.getElementById('reportComment-' + commentId);

    data.report = report.value;

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