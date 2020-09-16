import store from '@/store'
import { getToken } from '@/utils/auth'

export async function ssofilter(to, form, next) {
  // 情况1 没有token 访问接口直接触发401重定向
  let goPath = to.path
  if (goPath === '/404' && to.redirectedFrom && to.redirectedFrom.indexOf('access_token') > -1) {
    goPath = to.redirectedFrom
  }

  const token = getToken()
  // 没有token 并且路径中不包含token那就触发url重定向
  if (!token && goPath.indexOf('access_token') === -1) {
    await store.dispatch('user/getInfo')
    next(goPath.split('&')[0])
  }
  // 情况二 路径携带token 并且本地没有token
  if (!token && goPath.indexOf('access_token') > -1) {
    const paramQuery = goPath.split('&')
    const paramMap = {}
    for (let i = 1; i < paramQuery.length; i++) {
      const tmpQuery = paramQuery[i].split('=')
      paramMap[tmpQuery[0]] = tmpQuery[1]
    }

    if (paramMap['access_token']) {
      await store.dispatch('user/ssoLogin', paramMap['access_token'])
      next(goPath.split('&')[0])
    } else {
      next(false)
    }
  } else {
    // 普通页面跳转
    next()
  }
}
