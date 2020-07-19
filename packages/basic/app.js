const fs = require('fs')
const ipfsClient = require('ipfs-http-client')
const express = require('express')
const bodyPareser = require('body-parser')
const fileUpload = require('express-fileupload')

const ipfs = new ipfsClient({ host: 'localhost', port: '5001', protocol: 'http' })
const app = express()

app.set('view engine', 'ejs')
app.use(bodyPareser.urlencoded({ extended: true }))
app.use(fileUpload())

app.get('/', (req, res) => {
  res.render('home')
})

app.post('/upload', (req, res) => {
  const file = req.files.file
  const fileName = req.body.fileName
  const filePath = 'files/' + fileName

  file.mv(filePath, async (err) => {
    if (err) {
      console.log('Failed to upload')
      return res.status(500).send(err)
    }

    const fileHash = await addFile(fileName, filePath)

    fs.unlink(filePath, (err) => {
      if (err) console.log(err)
    })

    res.render('upload', { fileName, fileHash })
  })
})

const addFile = async (fileName, filePath) => {
  const file = fs.readFileSync(filePath)
  const fileAdded = await ipfs.add({ path: fileName, content: file })
  console.log('loool', fileAdded)
  const fileHash = fileAdded[0].hash

  return fileHash
}

app.listen(3000, () => {
  console.log('Listetning on 3000...')
})
