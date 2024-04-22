# CSE 312 TBD Project

## Deployment

https://tobedetermined.blog

## Part 3 AO1: Scheduled Posts

When logged in, navigate to the "Create Post" form, which will include a "Schedule Post" input. Use this optional input to schedule a post to release at a particular date and time.

A user can see their own scheduled posts on the home page. Those scheduled posts are retrieved from the server (endpoint: `GET /api/v1/posts/scheduled`). In particular, the time remaining will be shown and updated live, by retrieving the time remaining from the server (endpoint: `GET /api/v1/posts/scheduled/:id/remaining-time`). Once the countdown reaches 0, the post will be live for all users.

## Part 2 AO1: Multimedia Uploads

A required banner image must be uploaded in the "Create Post" form, accessed via the "Create Post" button on the home page. They are displayed alongside the post on the home page after submitting.

## Part 2 AO2: WebSockets

Websockets are supported by the comments on each post. When a comment is created or deleted, websockets are used for communicating this change and the UI is updated live. Note that creating a new *post/report* (rather than comment) is not supported by websockets and requires a refresh to see them; testing for websockets would need to begin after creating one or more posts and then refreshing the page.

## Registering

Password requirements are the same as the homework: 8 characters long, 1 lowercase, 1 uppercase, 1 number, 1 "special character". For instance, `Changeme1!` will suffice.

Registration does not automatically log you in. You must login after registering.