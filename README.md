# humint

**Humint** tagged logger for node.

## Install

    npm install --save humint

## Usage

Lets write some short sequences

```js
import Logger from 'humint'
const log = Logger`module name`
//Its short form for Logger('module name')
log`done`('Logger active')
log('you','can','use')('any','number','of','tags')
log(['or nested',['arrays','of','tags','and,combinations']])('...')
log`or,just,write,with,comma`({ objects:['or','arrays'] },'are valid too')
log`error,something going wrong`(
    'error will have red higlight, any other tags will be yellow')
```

Also you can use error, warn or info(default) methods (winston native feature)

```js
log.warn`warning`('Logger active')
log.error`oop`('error info')
```

### Map

For arrays you can use .map method

```js
log.map`Print array`(['each', 'element', 'will', 'logs', 'on', 'new', 'line'])
```

### Debug

Debug-like behavior. Method .debug will prints only when module name includes in DEBUG enviroment variable

> set DEBUG=humint:* & node index.js

```js
const log = require('humint')('humint:debugging')

log.debug`debug info`('You will see this only when DEBUG is set')
```

## License

MIT © [Zero Bias](https://github.com/zerobias)