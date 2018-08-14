var test = require('tapenet')

var {h1, h2} = test.topologies.basic()

test('share an old-style dat between two nodes (dat-node staging)', function (t) {
  t.run(h1, function () {
    var path = require('path')
    var Dat = require('@jimpick/dat-node')
    var tempy = require('tempy')
    var helpers = require(path.resolve(__dirname, './helpers'))

    var dir = tempy.directory()

    h2.on('sharing', ({key}) => {
      Dat(dir, {key: key, temp: true}, function (err, dat) {
        if (err) throw err
        // dat.joinNetwork()

        var network = dat.joinNetwork(function (err) {
          t.error(err && err.toString(), 'h1 joinNetwork calls back okay')
        })
        network.once('connection', function () {
          t.pass('h1 got connection')
        })

        t.pass('h1 downloading dat://' + key)

        var archive = dat.archive
        if (archive.content) contentReady()
        archive.once('content', contentReady)

        function contentReady () {
          t.pass('h1 content ready')
          archive.content.once('sync', function () {
            setTimeout(() => { // FIXME: Shouldn't be necessary
              t.pass('h1 dat synced')
              helpers.verifyFixtures(t, archive, function (err) {
                t.error(err, 'error')
                t.end()
              })
            }, 100)
          })
        }
      })
    })
  })

  t.run(h2, function () {
    var Dat = require('@jimpick/dat-node')
    var path = require('path')
    var fixture = path.join(__dirname, '../../fixtures/dat1')

    Dat(fixture, {temp: true}, function (err, dat) {
      if (err) throw err
      dat.importFiles()

      var network = dat.joinNetwork(function (err) {
        t.error(err && err.toString(), 'h2 joinNetwork calls back okay')
      })
      network.once('connection', function () {
        t.pass('h2 got connection')
      })

      t.pass('h2 sharing dat://' + dat.key.toString('hex'))
      h2.emit('sharing', {key: dat.key.toString('hex')})
    })
  })
})
