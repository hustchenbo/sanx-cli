# sanx-cli
sanx cli is a scaffolding for [San.js](https://github.com/baidu/san) development, and you can use it as a scaffolding for any other project.  
If you have been used the [vue-cli](https://github.com/vuejs/vue-cli/tree/master)before，you will find they are very similar, they are both based on  [metalsmith](https://github.com/segmentio/metalsmith) to handle template. To reduce the learning cost of developers, we referenced the usage and plugins from vue-cli, so the developers can easily create their own template just as they do in vue project.  
### Installation

Prerequisites: [Node.js](https://nodejs.org/en/) (>=8.x), npm version 4+ and [Git](https://git-scm.com/).

``` bash
$ npm install -g sanx-cli
```

### Usage

``` bash
$ sanx init <template-name> <project-name>
```

Example:

``` bash
$ sanx init hustchenbo/san-webpack  my-project
```

It will download the template from a git repo and generate the project to the dest. 

You can use your local template too. 

Example:

``` bash
$ sanx init localDir my-project
```