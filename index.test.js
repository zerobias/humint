'use strict'
const test = require('tap').test
const Logger = require('./index')

const text = 'message'

test('Smoke test', t => {

  t.type(Logger, 'function', 'Logger is a function')
  t.notThrow(() => Logger('Smoke test'), 'Logger should not fall')
  const log = Logger('Smoke test')
  t.type(log, 'function', 'log is a function')
  t.notThrow(() => log`tag,another tag`, 'log`tags` should not fall')
  t.notThrow(() => log`tag,another tag`(text), 'log`tags`(`message`) should not fall')
  t.notThrow(() => log('tag', 'another tag')(text), 'log(`splitted`, `tags`)(`message`) should not fall')

  t.notThrow(() => log.map('map')([text, 'second value', 'third']), 'log.map should not fall')

  t.end()
})

test('Returning test', t => {
  const log = Logger('Returning test')
  let ret = log`returns 'message'`(text, 'not wanted')
  t.equal(ret, text, 'log should return first printed value')
  const list = [text, 'second value', 'third']
  ret = log.map`returns,map`(list)
  t.equal(ret, list, 'log should return first printed value')
  t.end()
})

test('Edge cases', t => {
  const log = Logger('Edge cases')
  t.notThrow(() => log``(text), 'log`` should not fall')
  t.notThrow(() => log('')(text), 'log(``) should not fall')
  t.notThrow(() => log()(text), 'log() should not fall')
  t.notThrow(() => log`,`(text), 'log`,` should not fall')
  t.notThrow(() => log`no data`(), 'log without data should not fall')

  t.end()
})

test('Sub loggers', t => {
  const log = Logger('Sub loggers')
  t.type(log.info, 'function', 'log.info is a function')
  t.type(log.warn, 'function', 'log.warn is a function')
  t.type(log.error, 'function', 'log.error is a function')
  t.type(log.debug, 'function', 'log.debug is a function')

  t.end()
})

test('Debug logger', t => {
  const visibleLog = Logger('humint:visible')
  const invisibleLog = Logger('humint:invisible')

  t.notThrow(() => visibleLog.debug`visible`(text), 'visibleLog.debug should not fall')
  t.notThrow(() => invisibleLog.debug`invisible`(text), 'invisibleLog.debug should not fall')
  t.notThrow(() => invisibleLog.debug.map`invisible`([text]), 'invisibleLog.debug.map should not fall')
  t.notThrow(() => visibleLog.debug.map`visible,map`([text]), 'visibleLog.debug.map should not fall')

  t.end()
})
