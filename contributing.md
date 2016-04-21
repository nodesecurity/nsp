# Contributing

When making a pull request for this repo, please make sure of a few things

- tests and linting should pass for you locally. We have CI tests that also enforce this.
- rebuild the shrinkwrap file if you're changing any dependencies.

## Rebuilding the shrinkwrap

Because of the differences beween npm versions 2 and 3, you will want to use npm 2.  A shrinkwrap built under npm 2 will also work under npm 3.  A shrinkwrap built under npm 3 will *not* work under npm 2.

The simplest way to build a new shrinkwrap is to start with an empty node_modules.  Once you've done that and have made sure you're using npm 2:

```sh
$ npm install
$ npm run shrinkwrap
```

Note that it is `npm run shrinkwrap` not `npm shrinkwrap`.  This is because we have a shrinkwrap script that not only runs the shrinkwrap itself but also runs `shrinkydink`, a post-processor that cleans out some unneeded info we don't want.
