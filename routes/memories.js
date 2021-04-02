const express = require('express')
const router = express.Router()
const { ensureAuth} = require('../middleware/auth')
const Memory = require('../models/Memory')


//@desc Show Add Page
//@route GET /memories/add
router.get('/add', ensureAuth , (req, res) => {
    res.render('memories/add')
})

// @desc    Process add form
// @route   POST /memories
router.post('/', ensureAuth, async (req, res) => {
    try {
      req.body.user = req.user.id
      await Memory.create(req.body)
      res.redirect('/dashboard')
    } catch (err) {
      console.error(err)
      res.render('errors/500')
    }
  })

// @desc    Show all stories
// @route   GET /memories
router.get('/', async (req, res) => {
    try {
      const memories = await Memory.find({ status: 'public' })
        .populate('user')
        .sort({ createdAt: 'desc' })
        .lean()
  
      res.render('memories/index', {
        memories,
      })
    } catch (err) {
      console.error(err)
      res.render('errors/500')
    }
  })

// @desc    Show edit page
// @route   GET /memories/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
    try {
      const memory = await Memory.findOne({
        _id: req.params.id,
      }).lean()
  
      if (!memory) {
        return res.render('errors/404')
      }
  
      if (memory.user != req.user.id) {
        res.redirect('/memories')
      } else {
        res.render('memories/edit', {
          memory,
        })
      }
    } catch (err) {
      console.error(err)
      return res.render('errors/500')
    }
  })

// @desc    Update memory
// @route   PUT /memories/:id
router.put('/:id', ensureAuth, async (req, res) => {
    try {
      let memory = await Memory.findById(req.params.id).lean()
  
      if (!memory) {
        return res.render('errors/404')
      }
  
      if (memory.user != req.user.id) {
        res.redirect('/stories')
      } else {
        memory = await Memory.findOneAndUpdate({ _id: req.params.id }, req.body, {
          new: true,
          runValidators: true,
        })
  
        res.redirect('/dashboard')
      }
    } catch (err) {
      console.error(err)
      return res.render('errors/500')
    }
  })

// @desc    Delete memory
// @route   DELETE /memories/:id
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    let memory = await Memory.findById(req.params.id).lean()

    if (!memory) {
      return res.render('errors/404')
    }

    if (memory.user != req.user.id) {
      res.redirect('/memories')
    } else {
      await Memory.remove({ _id: req.params.id })
      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('errors/500')
  }
})

// @desc    Show single memory
// @route   GET /memories/:id
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    let memory = await Memory.findById(req.params.id).populate('user').lean()

    if (!memory) {
      return res.render('errors/404')
    }

    if (memory.user._id != req.user.id && memory.status == 'private') {
      res.render('errors/404')
    } else {
      res.render('memories/show', {
        memory,
      })
    }
  } catch (err) {
    console.error(err)
    res.render('errors/404')
  }
})

module.exports = router