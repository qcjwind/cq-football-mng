import fs from 'fs'
import path from 'path'
import archiver from 'archiver'
import scp from 'node-scp'
import { Client as SSHClient } from 'ssh2'
import minimist from 'minimist'
import dayjs from 'dayjs'

const remotePathDev = '/usr/share/nginx' // dev zip资源路径
const resourcesName = 'resources' // zip资源文件夹名称
const fileName = 'yc' // 需要发布的文件名
const fullName = `${fileName}${dayjs().format('YYYYMMDDHHmmss')}.zip` // zip文件全称

const sshConfig = {
  dev: {
    host: '47.108.163.156',
    username: 'root',
    password: 'Yuchao2025###',
    dest: remotePathDev,
    port: 22,
  },
}

const knownOptions = [
  {
    string: 'env',
    default: { env: 'dev' },
  },
  {
    string: 'apk',
  },
  {
    string: 'apkPath',
  },
]
const options = minimist(process.argv.slice(2), knownOptions)
let service = sshConfig[options.env]

if (!service) {
  console.error('发布失败！！！，未指定资源服务器')
  process.exit(1)
}

// 压缩文件
async function zipFiles() {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(path.join('dist_zip', fullName))
    const archive = archiver('zip', { zlib: { level: 9 } })

    output.on('close', () => {
      console.log(`资源压缩完成: ${fullName}, 共计 ${archive.pointer()} 字节`)
      resolve()
    })

    archive.on('error', (err) => {
      console.error('资源压缩失败', err)
      reject(err)
    })

    archive.pipe(output)
    archive.directory('dist/', false) // false 表示只包含 dist 内部内容
    archive.finalize()
  })
}

// 上传Apk文件
async function uploadApkFile() {
  if(!options.apkPath) {
    console.error('上传失败！！！，未指定apk资源')
    process.exit(1)
  }
  const localPath = options.apkPath
  const remoteDest = `${service.dest}/${resourcesName}/apk/app.apk`

  try {
    console.log(`连接到服务器: ${service.host}:${service.port}`)
    const client = await scp.Client({
      host: service.host,
      port: service.port,
      username: service.username,
      password: service.password,
    })

    console.log(`尝试上传: 本地路径: ${localPath} -> 远程路径: ${remoteDest}`)
    await client.uploadFile(localPath, remoteDest)
    console.log(`资源上传完成: ${remoteDest}`)
    client.close()
    return Promise.resolve()
  } catch (err) {
    console.error('资源上传失败', err.message)
    return Promise.reject(err)
  }
}

// 上传文件
async function uploadFile() {
  const localPath = `dist_zip/${fullName}`
  const remoteDest = `${service.dest}/${resourcesName}/${fileName}`

  try {
    console.log(`连接到服务器: ${service.host}:${service.port}`)
    const client = await scp.Client({
      host: service.host,
      port: service.port,
      username: service.username,
      password: service.password,
    })

    console.log(`尝试上传: 本地路径: ${localPath} -> 远程路径: ${remoteDest}/${fullName}`)
    await client.uploadFile(localPath, `${remoteDest}/${fullName}`)
    console.log(`资源上传完成: ${remoteDest}/${fullName}`)
    client.close()
    return Promise.resolve()
  } catch (err) {
    console.error('资源上传失败', err.message)
    return Promise.reject(err)
  }
}

// 执行远程命令
async function executeShellCommands() {
  return new Promise((resolve, reject) => {
    const ssh = new SSHClient()
    ssh
      .on('ready', () => {
        console.log('SSH 连接成功')
        const commands = [
          `rm -rf ${remotePathDev}/html/*`,
          `unzip -o -d ${remotePathDev}/html/ ${service.dest}/${resourcesName}/${fileName}/${fullName}`,
        ]
        ssh.exec(commands.join(' && '), (err, stream) => {
          if (err) {
            console.error('远程命令执行失败', err)
            reject(err)
          }
          stream
            .on('close', (code, signal) => {
              console.log('远程命令执行完成')
              ssh.end()
              resolve()
            })
            .on('data', (data) => {
              console.log(`STDOUT: ${data}`)
            })
            .stderr.on('data', (data) => {
              console.error(`STDERR: ${data}`)
            })
        })
      })
      .connect({
        host: service.host,
        port: service.port,
        username: service.username,
        password: service.password,
      })
  })
}

// 主流程
;(async () => {
  try {
    if (options['apk']) {
      console.log('开始上传apk...')
      await uploadApkFile()
    } else {
      console.log('开始压缩文件...')
      await zipFiles()

      console.log('开始上传文件...')
      await uploadFile()

      console.log('开始执行远程命令...')
      await executeShellCommands()

      console.log('发布完成！')
    }
  } catch (err) {
    console.error('发布失败', err)
    process.exit(-1)
  }
})()
