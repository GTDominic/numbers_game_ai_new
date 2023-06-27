# Introduction

This project uses algorithms to solve the game "Numbers Game"

## Dependencies

- npm-run-all
- browser-sync
- typescript

## Development installation

Run `npm install` for the installation.

Start the project with `npm start`.

## Creating your own algorithm

Create your own class which extends the `AIAbstract` class.  
This class needs a `public step(): void` method which is executed once every step.  
You can use the `protected checkOrFinished(): void()` method to check for finished.  
If finished `protected finished: boolean` will be true.

To use the algorithm, add an option to `index.html` and to `main.ts`.
