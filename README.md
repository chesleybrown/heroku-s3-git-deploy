heroku-s3-git-deploy
=========================

[![Build Status](https://travis-ci.org/chesleybrown/heroku-s3-git-deploy.svg)](https://travis-ci.org/chesleybrown/heroku-s3-git-deploy)
[![Dependency Status](https://david-dm.org/chesleybrown/heroku-s3-git-deploy.svg)](https://david-dm.org/chesleybrown/heroku-s3-git-deploy)
[![devDependency Status](https://david-dm.org/chesleybrown/heroku-s3-git-deploy/dev-status.svg)](https://david-dm.org/chesleybrown/heroku-s3-git-deploy#info=devDependencies)

Micro app for deploying to Amazon S3.

# Running on Heroku

First just deploy a free instance of the app on heroku using the button then just follow the steps below. 

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

1. Add a `Pull Request POST` hook in Bitbucket for `Create / Edit / Merge / Decline` that points to your instance of this app.

# Running Locally

Server runs on port `8000` by default, but will use the port set
on the environment variable `PORT` if set.

1. Run `npm install` for the initial setup.
1. Run `npm start` to start the server.

# Tests

To execute all the tests, just run:

```
npm test
```
