import test from 'ava'
import got from 'got'
import { CookieJar } from 'tough-cookie'
import {
  prismy,
  res,
  createUrlEncodedBodySelector,
  methodSelector,
  contextSelector,
} from 'prismy'
import { testHandler } from 'prismy-test'
import { createCookiesSelector, appendCookie } from '../src'

test('integration test', async (t) => {
  const urlEncodedBodySelector = createUrlEncodedBodySelector()
  const cookiesSelector = createCookiesSelector()
  const handler = prismy(
    [methodSelector, cookiesSelector, contextSelector],
    async (method, cookies, context) => {
      if (method === 'POST') {
        const { message } = await urlEncodedBodySelector(context)
        return appendCookie(res('OK!'), ['message', message as string])
      }

      return res(cookies.message)
    }
  )

  await testHandler(handler, async (url) => {
    const cookieJar = new CookieJar()
    const postResponse = await got(url, {
      method: 'POST',
      cookieJar,
      form: {
        message: 'Hello, World!',
      },
    })
    t.is(postResponse.body, 'OK!')

    const getResponse = await got(url, {
      cookieJar,
    })
    t.is(getResponse.body, 'Hello, World!')
  })
})
