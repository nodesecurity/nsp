# How the CLI app is structured.

The CLI consists of a `lib/commands` folder that contains all the supported commands.

Each file should be named what you want the command to be. It should export a single function that takes the `config` object as the first argument and a callback as the second.

The `config` contains the entire merged config object as assembled by [rc](https://www.npmjs.com/package/rc) which merges commandline arguments with `.requiresaferc` files as described by the rc docs.

So any command line flags that are passed will be available here. 


## Access to the SDK.

In addition, an instance of the [requiresafe-sdk](https://www.npmjs.com/package/requiresafe-sdk) is sent along with the config object as `.api`.

### The `local` flag

For simplicity while developing there's a `local` flag that will passed to the SDK that will send API requests to `localhost:3001` instead of the production API. 

So you can pass it to any command as follows:

```
requiresafe login --local
```

## The help docs

The CLI's help docs are all extracted directly from the multi-line comment at the top of each command file in the `lib/commands` folder.

## Creating aliases

If you want `l` to be an alias for the `list` command, for example, simply [add it to the list of aliases here](https://github.com/liftsecurity/requiresafe-cli/blob/master/lib/cli.js#L8-L12);

## Data gathering

Data from users is collected via the [inquirer](https://www.npmjs.com/package/inquirer) module.

See `lib/login` command as an example.

## Storing data / configs

To store or edit a setting in the config use the `lib/update-config` module. It exports a single function:

```js
var updateConfig = require('./lib/update-config');

// can be called with name/value
updateConfig('name', 'henrik', function (err) {
    if (!err) console.log('stored!');
});

// can also take an object (which will be merged into the existing config)
updateConfig({name: 'something', other: 'thing'}, function (err) {});

// to delete keys, simply set them to `''`
updateConfig('name', '', function (err) {});

// can also delete multiple by using an object
updateConfig({name: '', other: ''}, function (err) {});
```
