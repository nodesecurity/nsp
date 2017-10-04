# nsp [![Build Status](https://drone.andyet.com/api/badges/nodesecurity/nsp/status.svg)](https://drone.andyet.com/nodesecurity/nsp)

## About Node Security

Node Security helps you keep your node applications secure. With Node Security you can:

* Make use of the CLI tool to help identify [known vulnerabilities](https://nodesecurity.io/advisories/) in your own projects.
* Get access to Node Security news and information from the ^lift team.

## Installing the CLI (nsp)

* To install the Node Security command line tool: `npm install -g nsp`
* Then run `nsp --help` to find out more.

## Output Reporters

You can adjust how the client outputs findings by specifying one of the following built in reporters:

- table
- summary
- json
- codeclimate
- minimal

Example: `nsp check --reporter summary`

Additionally, you can use [third-party reporter](https://www.npmjs.com/search?q=nsp+reporter). The packages of custom reporters must adhere to the naming scheme `nsp-reporter-<name>` and can then be referenced by that name:
```bash
$ npm install -g nsp nsp-reporter-checkstyle
$ nsp check --reporter checkstyle
```
Please note that in case of naming conflicts built-in reporters (as listed above) take precedence. For instance, `nsp-reporter-json` would never be used since nsp ships with a `json` formatter.

## Exceptions

The Node Security CLI supports adding exceptions. These are advisories that you have evaluated and personally deemed unimportant for your project.

There are two ways to leverage this capability, online or offline. To use online exceptions, register your project on [our online portal](https://nodesecurity.io). From there you can manage your exceptions from a central location.

In order to inform the CLI tool that it should use these settings, you'll have to create a settings file (and login if your project is private). You'll need both the organization name and the UUID for your project, these can be
retrieved from the URL from our portal. For example, if your project is [hapi](https://github.com/hapijs/hapi) and your project URL is https://nodesecurity.io/orgs/hapi/projects/2a6e5642-b7a1-4b93-b8fb-21c1a5043f42 then your
organization name is `hapi` and your project UUID is `2a6e5642-b7a1-4b93-b8fb-21c1a5043f42`.

Using that information, create a `.nsprc` file with the following content:

```js
{
  "org": "hapi",
  "integration": "2a6e5642-b7a1-4b93-b8fb-21c1a5043f42"
}
```

When you next run `nsp check` your exceptions will be retrieved from online. If your project is a private one, you will additionally need to run `npm login` which will create another `.nsprc` file in your home directory with an
authentication token that will allow the CLI tool to look up your settings.

For offline exceptions, create a `.nsprc` file in the root of your project with content like the following:

```js
{
  "exceptions": ["https://nodesecurity.io/advisories/12"]
}
```

The URLs used in the array should match the advisory link that the CLI reports. With this in place, you will no longer receive warnings about any advisories in the exceptions array.

Be careful using this feature. If you add code later that is impacted by an excluded advisory, Node Security has no way of knowing. Keep a careful eye on your exceptions.

`.nsprc` is read using [rc](https://github.com/dominictarr/rc), so it supports comments using [json-strip-comments](https://github.com/sindresorhus/strip-json-comments).

## Proxy Support

The Node Security CLI has proxy support by using [https-proxy-agent](https://www.npmjs.com/package/https-proxy-agent).

To configure the proxy set the proxy key in your `.nsprc` file. This can be put in the root of your project or in your home directory.

```js
{
    "proxy": "http://127.0.0.1:8080"
}
```

The CLI tool will also automatically detect your proxy if it is exported to the environment as `HTTP_PROXY` or `HTTPS_PROXY`.

## Offline mode

Run `nsp gather` to save `advisories.json` locally, then `nsp check --offline` or `nsp check --offline --advisories /path/to/advisories.json`

## Code Climate Node Security Engine

`codeclimate-nodesecurity` is a Code Climate engine that wraps the Node Security CLI. You can run it on your command line using the Code Climate CLI, or Code Climate's <a href="http://codeclimate.com">hosted analysis platform</a>.

Note that this engine *only* works if your code has a `npm-shrinkwrap.json` or `package-lock.json` file committed.

### Testing

First, build this repo with docker

```
git clone git@github.com:nodesecurity/nsp
cd nsp
docker build -t codeclimate/codeclimate-nodesecurity .
```

Install the codeclimate CLI

```
brew tap codeclimate/formulae
brew install codeclimate
```

Go into your project's directory and enable codeclimate

```
codeclimate init
```

Then edit `.codeclimate.yml` to add the engine like so

```yaml
---
engines:
  nodesecurity:
    enabled: true
exclude_paths: []
```

And finally run it

```
codeclimate analyze --dev
```

## Suggesting Changes to Advisories
Should you come across data in an advisory that you feel is wrong or is a false positive please let us know at report@nodesecurity.io. We endeavor to make this process better in the future, however this is the best place to resolve these issues at the present.

## Contact

Node Security (+) is brought to you by [^lift security](https://liftsecurity.io).

## License

    Copyright (c) 2016 by ^Lift Security

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

    See the License for the specific language governing permissions and
    limitations under the License.

Note: the above text describes the license for the code located in this repository *only*. Usage of this tool or the API this tool accesses implies acceptance of our [terms of service](https://nodesecurity.io/tos).
