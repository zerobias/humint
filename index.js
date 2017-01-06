'use strict'
const winston = require('winston')
const chalk = require('chalk')
const enabled = require('debug').enabled
const { equals, unless, trim, toUpper, split, reject, isNil, flatten, map,
  isEmpty, join, is, ifElse, when, take, addIndex, sum, add, length, defaultTo, head, tail, type } = require('ramda')
const P = require('ensue')

const yellowTag = chalk.bold.yellow
const redTag = chalk.bold.bgRed.black

//Simply write 'error' and its will be marked red,
//and any other wiil be yellow if its hasnt have color yet
const colorize = ifElse(
  equals(`[ERROR]`),
  redTag,
  unless(chalk.hasColor, yellowTag))

//' raw tag   ' => '[RAW TAG]'
const normalizeTag = P(
  trim,
  toUpper,
  e => `[${e}]`,
  colorize)

//Split tag strings and reject emtpy
//'tag1,tag2,,tag4'
// => [ 'tag1', 'tag2', '', 'tag4' ]
// => [ 'tag1', 'tag2', 'tag4' ]
const splitTagArray = P(
  split(','),
  reject(isNil))


const normalizeTags = P(
  flatten,
  // allow to send any combination of tags arrays:
  // [ 'tag1', [ 'special tag', 'custom tag', [ 'index tag' ] ] ] =>
  // [ 'tag1', 'special tag', 'custom tag', 'index tag' ]
  map(splitTagArray), // [ 'tag1,tag2', 'tag3' ] into [ 'tag1', 'tag2', 'tag3' ]
  flatten,
  reject(isEmpty),
  map(normalizeTag),
  join(''))

const isArray = is(Array)

const normalizeDefaults = ifElse(
  isEmpty,
    () => '', //TODO replace with identity
    normalizeTags) //Normalize every non-empty tag

const throwNonArray = e => { throw new TypeError(`Recieved ${type(e)} (non-array) object`) }

//function arrayPrint allows ony arrays
const arrayCheck = unless( isArray, throwNonArray )

const maxArrayLn = 50
//trim arrays to first 50 elements
const messageArrayProtect = map(
  when(
    isArray,
    take( maxArrayLn ) ) )


//Special declaration in ramda to create common map function: (object,index)=>...
//Because map by default allow only object=>... form
const indexedMap = addIndex(map)

/**
 * Allow to select log level
 * @function genericLog
 * @param {LoggerInstance} logger Winston logger instance
 * @param {string} moduletag Module tag name
 * @param {string} logLevel Log level
 */
function genericLog(logger, moduletag, logLevel='info'){
  const isDebug = logLevel==='debug'
  const level = isDebug
    ? 'info'
    : logLevel
  const levelLogger = logger[level]
  const active = isDebug
    ? enabled(moduletag)
    : true

  /**
   * tagged Logger
   * @function taggedLog
   * @param {...string} tags Optional message tags
   */
  function taggedLog(...tags) {
    const tag = normalizeDefaults(tags)
    /**
     * message Logger
     * @function messageLog
     * @template T
     * @param {...T} messages message
     * @returns {T}
     */
    function messageLog(...messages) {
      if (active) {
        const protectedMessage = messageArrayProtect(messages)
        levelLogger(tag, ...protectedMessage)
      }
      return messages[0]
    }
    return messageLog
  }
  /**
   * Array logge Prinst every value on separated line
   * @function mapLog
   * @param {...string} tags Optional message tags
   */
  function mapLog(...tags) {
    /**
     * Array logge Prinst every value on separated line
     * @function printArray
     * @param {Array} message Printed list
     * @returns {Array}
     */
    function printArray(message) {
      if (active) {
        arrayCheck(message)
        const tag = normalizeDefaults(tags)
        //count length + 2. Also handles edge case with objects without 'length' field
        const spaceLn = P(
          length,
          defaultTo(0),
          add(2) )
        const ln = sum( map( spaceLn, tags ) )
        const spaces = new Array(ln)
          .fill(' ')
          .join('')

        const getFormatted = num => chalk.green(`<${num}>`)
        levelLogger( tag, getFormatted(0), head( message ) )
        const printTail = (e, i) => levelLogger(spaces, getFormatted(i+1), e)

        P(
          tail,
          indexedMap(printTail)
        )(message)
      }
      return message
    }
    return printArray
  }
  taggedLog.map = mapLog
  return taggedLog
}
/**
 * Logging function based on winston library
 * @function Logger
 * @param {string} moduletag Name of apps module
 */
function Logger(moduletag) {
  const trimmedModule = trim(moduletag)
  winston.loggers.add(trimmedModule, {
    console: {
      colorize: true,
      label   : trimmedModule
    }
  })
  const logger = winston.loggers.get(trimmedModule)
  const defs = genericLog(logger, trimmedModule)
  defs.warn = genericLog(logger, trimmedModule, 'warn')
  defs.error = genericLog(logger, trimmedModule, 'error')
  defs.debug = genericLog(logger, trimmedModule, 'debug')
  defs.info = genericLog(logger, trimmedModule, 'info')
  return defs
}

module.exports = Logger