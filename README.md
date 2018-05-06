# Recipes-Test

## Description

This app is a simple web application built with AngularJS, Node.js and Postgres. Admin can post new Recipes and users can view or comment on it.

## Features

- [x] Create Recipe
- [x] Add Authentication to the administration
- [x] Add registration for new user
- [x] Add Comments to post

## Dependencies

You need `postgres` up and running on port `5432`

## Installation

Clone the repository with: `git clone https://github.com/omkarpg0931/Recipes-Test.git`

### Build angularjs app

install gulp and the gulp dependencies: `npm install`

Run gulp to build the scripts of the AngularJS app with: `gulp`

### Install Nodejs App

Go to the api folder and install the dependencies: `npm install`

Run the application: `npm start`

## Run

You can now open your browser: `http://localhost:3000/Recipes-Test/app`

Create a first account on `http://localhost/Recipes-Test/app/#/register`

To access the dashboard, go to `http://localhost/Recipes-Test/app/#/login`

## Stack

* AngularJS
* Bootstrap
* Postgres
* SequelizeJs
* Node.js