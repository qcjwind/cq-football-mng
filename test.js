// const mock = (resolve) => {
//   setTimeout(() => {
//     resolve('123')
//   }, 2000)
// }

// const post = () => {
//   return new Promise((resolve, reject) => {
//     mock(resolve)
//     setTimeout(() => reject('请求超时'), 3000)
//   })
// }

// post()
//   .then((res) => console.log(res))
//   .catch((err) => console.log(err))

// const mockRequest = (time) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve('success')
//     }, time)
//   })
// }

// const fetch = () => {
//   const timeOut = new Promise((_, reject) => {
//     setTimeout(() => reject(new Error('请求超时')), 3000)
//   })

//   return Promise.race([mockRequest(4000), timeOut])
// }

// fetch()
//   .then((res) => console.log(res))
//   .catch((err) => console.log(err))

// Promise.prototype.finally = (callback) => {
//   return this.then(
//     (value) => Promise.resolve(callback()).then(value),
//     (reason) =>
//       Promise.resolve(callback()).then(() => {
//         throw reason
//       }),
//   )
// }

// Promise.all = (promiseArr) => {
//   return new Promise((resolve, reject) => {
//     if (!Array.isArray(promiseArr)) {
//       throw new Error('不是数组')
//     }
//     if (promiseArr.length === 0) {
//       resolve([])
//       return
//     }
//     let count = 0
//     const result = new Array(promiseArr.length)
//     for (let i = 0; i < promiseArr.length; i++) {
//       Promise.resolve(promiseArr[i])
//         .then((res) => {
//           count++
//           result[i] = res
//           if (count === promiseArr.length) {
//             resolve(result)
//           }
//         })
//         .catch((err) => {
//           reject(err)
//         })
//     }
//   })
// }

// Promise.allSettled = (promises) => {
//   return Promise.all(
//     promises.map((promise) => {
//       return Promise.resolve(promise)
//         .then((value) => ({ status: 'fulfilled', value }))
//         .catch((reason) => ({ status: 'rejected', reason }))
//     }),
//   )
// }

// Promise.race = (promises) => {
//   return new Promise((resolve, reject) => {
//     for (const promise of promises) {
//       Promise.resolve(promise).then(resolve, reject)
//     }
//   })
// }

function throttle(func, wait) {
  let context, args
  let previous = 0

  return function () {
    let now = +new Date()
    context = this
    args = arguments

    // 判断时间间隔是否大于 wait
    if (now - previous > wait) {
      func.apply(context, args) // 调用目标函数
      previous = now // 更新上一次执行时间
    }
  }
}

const obj = {
  name: 'Alice',
  logName() {
    console.log(this.name)
  },
}

// 使用 throttle 包装 logName 方法
const throttledLogName = throttle(obj.logName, 1000)

// 调用 throttledLogName
throttledLogName() // 输出: Alice
