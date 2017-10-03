# Contributing

When making a pull request for this repo, please make sure of a few things

- tests and linting should pass for you locally. We have CI tests that also enforce this.
- rebuild the shrinkwrap file if you're changing any dependencies.

## Rebuilding the shrinkwrap

```sh
$ npm install
$ npm shrinkwrap
```
