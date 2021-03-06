![App Logo](https://raw.githubusercontent.com/chesleybrown/heroku-s3-git-deploy/master/media/logo-small.png) heroku-s3-git-deploy
=========================

[![Build Status](https://travis-ci.org/chesleybrown/heroku-s3-git-deploy.svg)](https://travis-ci.org/chesleybrown/heroku-s3-git-deploy)
[![Dependency Status](https://david-dm.org/chesleybrown/heroku-s3-git-deploy.svg)](https://david-dm.org/chesleybrown/heroku-s3-git-deploy)
[![devDependency Status](https://david-dm.org/chesleybrown/heroku-s3-git-deploy/dev-status.svg)](https://david-dm.org/chesleybrown/heroku-s3-git-deploy#info=devDependencies)

Micro app for automatically deploying to Amazon S3 on a BitBucket commit.

![What it looks like](https://raw.githubusercontent.com/chesleybrown/heroku-s3-git-deploy/master/media/screenshot.png)

# Running on Heroku

First just deploy a free instance of the app on heroku using the button then just follow the steps below. 

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

1. You will need `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` and `AWS_BUCKET` for your Amazon S3 account.
1. Create an API Key in Bitbucket for your team and use your team name as the `username` and the API Key as your `password` in the next step.
1. Set `BITBUCKET_USERNAME` and `BITBUCKET_PASSWORD` ENV variables to match with the `username` and `password` above.
1. Add a `POST` hook in Bitbucket that points to the `/commit-hook` end-point for your instance of this app. For example:
    - `https://<BITBUCKET_USERNAME>:<BITBUCKET_PASSWORD>@<YOUR_APP_NAME_ON_HEROKU>.herokuapp.com/commit-hook`
1. Now whenever code is pushed to the `master` branch, it will all be copied and deployed to Amazon S3.

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

To run all tests and watch for changes to re-run tests:

```
npm run watch
```