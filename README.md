# requireSafe (+)

[![Build Status](https://travis-ci.org/requiresafe/cli.svg)](https://travis-ci.org/requiresafe/cli)

## About requireSafe

requireSafe helps you keep your node applications secure. With requireSafe you can:

* Receive immediate notifications when Node Security Project advisories are created or updated.
* Make use of the CLI tool to help identify known vulnerabilities in your own projects.
* Get access to Node Security news and information from the ^lift team.

## Registering

To find out more, and to register for requiresafe, go to:

[https://requiresafe.com](https://requiresafe.com).

## Installing the CLI

* To install the requireSafe command line tool: `npm install -g requiresafe`
* Then run `requiresafe help` to find out more.

## Code Climate requiresafe Engine

`codeclimate-requiresafe` is a Code Climate engine that wraps the requiresafe CLI. You can run it on your command line using the Code Climate CLI, or on our hosted analysis platform.

Note that this engine *only* works if your code either has your `node_modules` directory or an `npm-shrinkwrap.json` file committed.

### Testing

First, build this repo with docker

```
git clone git@github.com:requiresafe/codeclimate-requiresafe
cd codeclimate-requiresafe
docker build -t codeclimate/codeclimate-requiresafe .
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
  requiresafe:
    enabled: true
exclude_paths: []
```

And finally run it

```
codeclimate analyze --dev
```

## Contact

requireSafe is brought to you by [^lift security](https://liftsecurity.io).

## License

    Copyright (c) 2015 by ^Lift Security

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

    See the License for the specific language governing permissions and
    limitations under the License.
