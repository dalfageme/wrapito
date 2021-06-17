import deepEqual from 'deep-equal'
import chalk from 'chalk'

let fetch

beforeEach(() => {
  fetch = jest.fn();
  global.fetch = fetch;
})

interface Options {
  method: string,
  body: object,
}

const emptyErrorMessage = (path: string) => ({
  pass: false,
  message: () => `🌯 Burrito: ${path} ain't got called`,
})

const fetchLengthErrorMessage = (path: string, expectLength: number, currentLength: number) => ({
  pass: false,
  message: () => `🌯 Burrito: ${path} is called ${currentLength} times, you expected ${expectLength} times`,
})

const methodDoesNotMatchErrorMessage = (expected: string, received: string) => ({
  pass: false,
  message: () =>
    `🌯 Burrito: Fetch method does not match, expected ${expected} received ${received}`,
})

const bodyDoesNotMatchErrorMessage = (expected: object, received: object) => ({
  pass: false,
  message: () =>
    `🌯 Burrito: Fetch body does not match.
Expected:
${chalk.green(JSON.stringify(expected, null, ' '))}

Received:
${chalk.red(JSON.stringify(received, null, ' '))}`,
})

const successMessage = () => ({
  pass: true,
  message: () => undefined,
})

const findRequestsByPath = (path: string) => {
  return fetch.mock.calls.filter((call: any) => call[0].url.includes(path))
}

const getRequestsMethods = (requests: any) =>
  requests.map((request: any) => request[0]?.method)

const getRequestsBodies = (requests: any) =>
  requests.map((request: any) => {
    if (!request[0]._bodyInit) return {}

    return JSON.parse(request[0]._bodyInit)
  })

const methodDoesNotMatch = (expectedMethod: string, receivedRequestsMethods: string[]) =>
  expectedMethod && !receivedRequestsMethods.includes(expectedMethod)

const bodyDoesNotMatch = (expectedBody: object, receivedRequestsBodies: object[]) => {
  if (!expectedBody) return false

  const anyRequestMatch = receivedRequestsBodies
    .map(request => deepEqual(expectedBody, request))
    .every(requestCompare => requestCompare === false)

  return anyRequestMatch
}

const empty = (requests: any) => requests.length === 0

const toHaveBeenFetchedWith = (path: string, options: Options) => {
  const targetRequests = findRequestsByPath(path)

  if (empty(targetRequests)) {
    return emptyErrorMessage(path)
  }

  const receivedRequestsMethods = getRequestsMethods(targetRequests)
  const expectedMethod = options?.method

  if (methodDoesNotMatch(expectedMethod, receivedRequestsMethods)) {
    return methodDoesNotMatchErrorMessage(expectedMethod, receivedRequestsMethods)
  }

  const receivedRequestsBodies = getRequestsBodies(targetRequests)
  const expectedBody = options?.body

  if (bodyDoesNotMatch(expectedBody, receivedRequestsBodies)) {
    return bodyDoesNotMatchErrorMessage(expectedBody, receivedRequestsBodies)
  }

  return successMessage()
}

const toHaveBeenFetched = (path: string) => {
  const requests = findRequestsByPath(path)
  return !requests.length ? emptyErrorMessage(path) : successMessage()
}

const toHaveBeenFetchedTimes = (path: string, expectedLength: number) => {
  const requests = findRequestsByPath(path)
  return requests.length !== expectedLength
    ? fetchLengthErrorMessage(path, expectedLength, requests.length)
    : successMessage()
}

export { toHaveBeenFetchedWith, toHaveBeenFetched, toHaveBeenFetchedTimes }
