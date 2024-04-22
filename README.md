# CSE 312 TBD Project

## Deployment

https://tobedetermined.blog

## Part 2 AO2 WebSockets

Websockets are supported by the comments on each post. When a comment is created or deleted, websockets are used for communicating this change and the UI is updated live. Note that creating a new *post/report* (rather than comment) is not supported by websockets and requires a refresh to see them; testing for websockets would need to begin after creating one or more posts and then refreshing the page.

## Registering

Password requirements are the same as the homework: 8 characters long, 1 lowercase, 1 uppercase, 1 number, 1 "special character". For instance, `Changeme1!` will suffice.

Registration does not automatically log you in. You must login after registering.