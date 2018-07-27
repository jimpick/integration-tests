module.exports.verifyFixtures = function (t, archive, cb) {
	archive.readdir('/', function (err, entries) {
    if (err) return cb(err)
		t.deepEqual(
			entries.sort(),
			[ 'README.md', 'assets', 'index.html' ],
			'top directory listing'
		)
    cb()
  })
}
