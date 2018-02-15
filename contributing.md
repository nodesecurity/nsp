# Contributing

When making a pull request for this repo, please make sure of a few things

- tests and linting should pass for you locally. We have CI tests that also enforce this.
- version of the testing library `lab` used is 14, after which there were breaking changes, so correct documentation is [here](https://github.com/hapijs/lab/blob/v14.x.x/README.md)
- rebuild the shrinkwrap file if you're changing any dependencies.

## Rebuilding the shrinkwrap

```sh
$ npm install
$ npm shrinkwrap
```
