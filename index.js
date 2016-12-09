const winston = require('winston')
const R = require('ramda')
const P = R.pipe
const chalk = require('chalk')

const yellowTag = chalk.bold.yellow
const redTag = chalk.bold.bgRed.black
const colorize = R.ifElse(
  R.equals(`[ERROR]`),
  redTag,
  R.unless(chalk.hasColor,yellowTag))
const normalizeTag = P(R.trim,R.toUpper,e=>`[${e}]`,colorize)
const splitTagArray = P(R.split(','),R.reject(R.isNil))
const normalizeTags = P(
  R.flatten,
  R.map(splitTagArray),
  R.flatten,
  R.map(normalizeTag),
  R.join(''))
const normalizeDefaults = R.ifElse(R.isEmpty,()=>'',normalizeTags)
const arrayCheck = R.unless(R.is(Array),e=>{throw new TypeError(`Recieved ${R.type(e)} (non-array) object`)})

const maxArrayProtectLen = 50
const messageArrayProtect = R.map( R.when(R.is(Array),R.take(maxArrayProtectLen)) )
/**
 * Allow to select log level
 * @function genericLog
 * @param {LoggerInstance} logger Winston logger instance
 * @param {string} logLevel Log level
 */
function genericLog(logger,logLevel='info'){
  const levelLogger = logger[logLevel]
  /**
   * tagged Logger
   * @function taggedLog
   * @param {...string} tags Optional message tags
   */
  function taggedLog(...tags){
    const _tag = normalizeDefaults(tags)
    /**
     * message Logger
     * @function messageLog
     * @param {...string} message message
     * @returns {void}
     */
    function messageLog(...message) {
      const protectedMessage = messageArrayProtect(message)
      levelLogger(_tag,...protectedMessage)
    }
    function printArray(message) {
      arrayCheck(message)
      const spaceLn = P(R.length,R.defaultTo(0),R.add(2))
      const ln = R.sum(R.map(spaceLn,tags))
      const spaces = new Array(ln).fill(' ').join('')
      const getFormatted = num=>chalk.green(`<${num}>`)
      levelLogger(_tag,getFormatted(0),R.head(message))
      const printTail = (e,i)=>levelLogger(spaces,getFormatted(i+1),e)
      P(R.tail,R.addIndex(R.map)(printTail))(message)
    }
    messageLog.map = printArray
    return messageLog
  }
  return taggedLog
}
/**
 * Logging function based on winston library
 * @function winLog
 * @param {string} moduletag Name of apps module
 */
function winLog(moduletag) {
  winston.loggers.add(moduletag,{ console: { colorize: true, label: moduletag } })
  const logger = winston.loggers.get(moduletag)
  const defs = genericLog(logger)
  defs.warn = genericLog(logger,'warn')
  defs.error = genericLog(logger,'error')
  defs.debug = genericLog(logger,'debug')
  defs.info = genericLog(logger,'info')
  return defs
}

//TODO Implement preview print
const printable = maxLen => R.pipe(R.toString,R.take(maxLen))
const printable100 = printable(100)

const debug = require('debug')

/**
 * Logging function
 * @function log
 * @param {string} moduletag Name of apps module
 */
function log (moduletag) {
  // if(_moduletag.length<align){

  //   moduletag = P(R.length,R.subtract(align),R.repeat(' '),R.prepend(_moduletag),R.apply(R.concat))(_moduletag)
  //   console.log(moduletag)
  //   // moduletag = _moduletag
  // }
  /**
   * tagged Logger
   * @function taggedLogger
   * @param {string} tag message tag
   */
  function taggedLogger(tag) {
    /**
     * message Logger
     * @function messageLogger
     * @param {...string} mess message
     * @returns {void}
     */
    function messageLogger(...mess) {
      debug(tag?[moduletag,tag].join(':  '):moduletag)(...mess)
      return void 0
    }
    return messageLogger
  }
  return taggedLogger
}
log.winLog = winLog

/** @module delogin/log
 *  @namespace delogin/log
 * */
module.exports = log