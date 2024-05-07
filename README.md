# CSE 312 TBD Project

## Deployment

https://tobedetermined.blog

## Part 3 AO3: Random Joke Generator
The app now has a new "random joke" generator feature. All users are now able to navigate to the random joke generator page where they can fetch as many jokes as they'd like by clicking the "Fetch Joke" button. Whenever the user clicks on the "Fetch Joke" button an API call is made via axios to an external API which returns a random joke. This feature utilizes the free API: https://icanhazdadjoke.com/api#google_vignette.

Testing Procedures:
1. Navigate to the homepage via: https://tobedetermined.blog/.
2. Click "Register" and register an account.
3. After being returned to the home page, click "Login" and log in using the same details used to create the account. This will redirect you back to the home page.
4. Click on the "Random Dad Jokes" button at the bottom of the page.
5. Confirm that the page initially has no jokes.
6. Click on the "Fetch Joke" button. Confirm that a random joke gets rendered on the page.
7. Check the networks tab to verify that clicking the Fetch Joke button makes a HTTP GET request to "https://icanhazdadjoke.com/".
8. Click on the "Fetch Joke" button several times. Confirm that a new joke is rendered each time the button is pressed.

(Note: We have also added a "Switch Theme" feature as a backup/additional feature which allows the user to switch between regular and dark theme. Only applies for the home page")


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
